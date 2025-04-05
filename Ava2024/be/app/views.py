from rest_framework.response import Response
from .models import LocationActivities, TransponderPing, HarborReport
from .serializers import LocationActivitiesSerializer, TransponderPingCustomSerializer,HarborReportCustomSerializer
from rest_framework.views import APIView
from datetime import datetime
from rest_framework import status
from django.core.cache import cache
from django.db import connection
from django.http import JsonResponse
from django.views import View
from datetime import datetime


class LocationActivitiesAPIView(APIView):

    def get(self, request):
        getAll_data = self.getAllLocationActivities(request)
        specific_data = self.getAllLocationActivitiesByLocation(request)
        response_data = {
                'getAllLocationActivities': getAll_data.data,
                'getAllLocationActivitiesByLocation': specific_data.data
         }
        return Response(response_data)

    def getAllLocationActivities(self, request, format=None):
        queryset = LocationActivities.objects.all()
        serializer_class = LocationActivitiesSerializer(queryset, many=True)
        return serializer_class

    def getAllLocationActivitiesByLocation(self, request, format=None):
        queryset = LocationActivities.objects.all()
        queryset = queryset.filter(location_id='Haacklee')
        serializer = LocationActivitiesSerializer(queryset, many=True)
        return serializer
    
class TransponderPingCustomView(APIView):
    def get(self, request, *args, **kwargs):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not start_date or not end_date:
            return Response({"error": "Start date and end date are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            start_date_str = datetime.strptime(start_date, '%Y-%m-%d').strftime('%Y-%m-%d')
            end_date_str = datetime.strptime(end_date, '%Y-%m-%d').strftime('%Y-%m-%d')
        except ValueError as e:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
        
        cache_key = f"transponder_pings_{start_date_str}_{end_date_str}"
        cached_data = cache.get(cache_key)

        if cached_data:
            return Response(cached_data)
        
        transponder_pings = TransponderPing.objects.filter(
            date_added__range=(start_date_str, end_date_str)
        ).select_related('vessel', 'location').all()
        count = transponder_pings.count()
        results = []
        for ping in transponder_pings:
            results.append({
                 "vesselid": ping.vessel.id,
                 "vesselname": ping.vessel.name,
                 "vesseltype": ping.vessel.type,
                 "locationid": ping.location.id,
                 "locationname": ping.location.name,
                 "dwell": ping.dwell,
                 "date_added": ping.date_added
            })
        cache.set(cache_key, results, timeout=60*60)
        serializer = TransponderPingCustomSerializer(results, many=True)
        return Response({'count': count, 'results': serializer.data})

class HarborReportCustomView(APIView):
    def get(self, request, *args, **kwargs):
        harbor_reports = HarborReport.objects.select_related('vessel', 'location').all()
        count = harbor_reports.count()

        results = []
        for report in harbor_reports:
            results.append({
                'vesselid': report.vessel.id,
                'vesselname': report.vessel.name,
                'vesseltype': report.vessel.type,
                'locationid': report.location.id,
                'locationname': report.location.name,
                'date_added': report.date_added,
                'date': report.date,
            })

        serializer = HarborReportCustomSerializer(results, many=True)
        return Response({'count': count, 'results': serializer.data})

class CargoVesselView(View):
    def get(self, request, *args, **kwargs):

        raw_sql = """
        SELECT d.id, v.id, v.name, t.location_id, tr.date, t."time"
	FROM public."TransponderPing" as t,  public."Vessel" as v, public."Delivery_Report" as d,
	public."Transaction" as tr where 
	d.id=tr.report_id and
	tr.target=t.location_id and 
	t."time" between tr.date and to_char(TO_DATE(tr.date,'YYYY-MM-DD')+1, 'YYYY-MM-DD')
	and t.vessel_id=v.id and v.type='Entity.Vessel.CargoVessel'
        """

        # Execute the raw SQL query
        with connection.cursor() as cursor:
            cursor.execute(raw_sql)
            rows = cursor.fetchall()

        # Construct the result
        result = []
        for row in rows:
            result.append({
                "delivery_report_id": row[0],
                "vessel_id": row[1],
                "vessel_name": row[2],
                "location_id": row[3],
                "transaction_date": row[4],
                "transponder_time": row[5],
            })

        return JsonResponse(result, safe=False)

class CargoPossibleIllegalFishing(View):
    def get(self, request, *args, **kwargs):
        # Get the report_id from the request parameters
        report_id = request.GET.get('report_id')
        
        if not report_id:
            return JsonResponse({'error': 'Missing report_id parameter'}, status=400)
        
        # Construct the SQL query
        raw_sql = """
        SELECT 
            v.name AS vessel_name, 
            l.name AS location_name,
            la.activity,
            t."time",
            v.type,
            SUM(CAST(t.dwell AS FLOAT)) AS total_dwell
        FROM 
            public."Transaction" AS tr
        JOIN 
            public."Fish_Location" AS fl ON tr.target = fl.fish_id
        JOIN 
            public."TransponderPing" AS t ON fl.location_id = t.location_id
        JOIN 
            public."Location" AS l ON l.id = fl.location_id
        JOIN 
            public."Vessel" AS v ON v.id = t.vessel_id
        JOIN
            public."Location_Activities" AS la ON la.location_id = fl.location_id
        WHERE 
            tr.report_id = %s
            AND DATE(t."time") BETWEEN DATE(tr.date) - INTERVAL '3 day' AND DATE(tr.date) + INTERVAL '1 day'
        GROUP BY 
            v.name, 
            l.name,
            la.activity,
            t."time",
            v.type
        ORDER BY
            total_dwell DESC;
        """
        
        # Execute the raw SQL query
        with connection.cursor() as cursor:
            cursor.execute(raw_sql, [report_id])
            rows = cursor.fetchall()
        
        # Construct the result
        result = []
        for row in rows:
            result.append({
                "vessel_name": row[0],
                "location_name": row[1],
                "activity": row[2],
                "time": row[3],
                "type": row[4],
                "total_dwell": row[5],
            })
        
        return JsonResponse(result, safe=False)
        

class TransponderPingCountView(View):
    def get(self, request, *args, **kwargs):
        # Get the start_date and end_date from query parameters
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        
        # Validate the input dates (basic validation, can be improved)
        if not start_date or not end_date:
            return JsonResponse({"error": "start_date and end_date parameters are required"}, status=400)
        
        # Define the SQL query with placeholders for dates
        raw_sql = """
        SELECT 
            v.type as vessel_type, 
            v.name AS vessel_name, 
            l.name AS location_name, 
            COUNT(t.dwell) AS count,
            SUM(CAST(t.dwell AS Float))
        FROM 
            public."TransponderPing" AS t
        JOIN 
            public."Vessel" AS v ON t.vessel_id = v.id
        JOIN 
            public."Location" AS l ON l.id = t.location_id
        WHERE 
            t.date_added BETWEEN %s AND %s
        GROUP BY  
            v.type,
            v.name, 
            l.name;
        """
        
        # Execute the raw SQL query with parameters
        with connection.cursor() as cursor:
            cursor.execute(raw_sql, [start_date, end_date])
            rows = cursor.fetchall()
        
        # Construct the result
        result = []
        for row in rows:
            result.append({
                "vessel_type": row[0],
                "vessel_name": row[1],
                "location_name": row[2],
                "count": row[3],
                'dwellSum' : row[4]
            })
        
        return JsonResponse(result, safe=False)
    
class HarborReportView(View):
    def get(self, request, *args, **kwargs):
        # Get the start_date and end_date from query parameters
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        
        # Validate the input dates (basic validation, can be improved)
        if not start_date or not end_date:
            return JsonResponse({"error": "start_date and end_date parameters are required"}, status=400)
        
        # Define the SQL query with placeholders for dates
        raw_sql = """
        SELECT 
            v.type AS vessel_type,
            v.name AS vessel_name, 
            l.name AS location_name, 
            COUNT(v.name) AS vessel_count
        FROM 
            public."Harbor_Report" AS h
        JOIN 
            public."Vessel" AS v ON h.vessel_id = v.id
        JOIN 
            public."Location" AS l ON l.id = h.location_id
        WHERE 
            h.date_added BETWEEN %s AND %s
        GROUP BY  
            v.type, 
            v.name, 
            l.name;
        """
        
        # Execute the raw SQL query with parameters
        with connection.cursor() as cursor:
            cursor.execute(raw_sql, [start_date, end_date])
            rows = cursor.fetchall()
        
        # Construct the result
        result = [
            {
                "vessel_type": row[0],
                "vessel_name": row[1],
                "location_name": row[2],
                "vessel_count": row[3]
            } for row in rows
        ]
        
        return JsonResponse(result, safe=False)

class TrendDataView(View):
    def get(self, request, *args, **kwargs):
        raw_sql = """
        SELECT 
            EXTRACT(YEAR FROM TO_TIMESTAMP(t."time", 'YYYY-MM-DD"T"HH24:MI:SS')) AS year,
            TO_CHAR(DATE_TRUNC('week', TO_TIMESTAMP(t."time", 'YYYY-MM-DD"T"HH24:MI:SS')), 'IW') AS week,
            t.location_id,
			v.name ,
            COUNT(t.dwell) AS dwell_count,
			SUM(CAST(t.dwell AS FLOAT)) AS total_dwell
        FROM 
            public."TransponderPing" t,  public."Vessel" v 
        WHERE 
            v.id = t.vessel_id and
            t.vessel_id in ('roachrobberdb6', 'snappersnatcher7be', 'wavewranglerc2d','arcticgraylingangler094',
'pompanoplunderere5d',
'bigeyetunabanditb73',
'europeanseabassbuccaneer777',
'huron1b3',
'plaiceplundererba1',
'whitemarlinwranglerbac',
'catfishcapturer7a8',
'whitemarlinwranglerbac',
'opheliacac')
        GROUP BY 
            year, week,t.location_id, v.name
        ORDER BY 
            total_dwell desc
        """
        with connection.cursor() as cursor:
            cursor.execute(raw_sql)
            rows = cursor.fetchall()

        result = [
            {
                "year": row[0],
                "week": row[1],
                "location_id": row[2],
                "name": row[3],
                "total_dwell": row[5]
            }
            for row in rows
        ]

        return JsonResponse(result, safe=False)


class TrendLineView(View):
    def get(self, request, *args, **kwargs):
        raw_sql = """
        SELECT 
            EXTRACT(YEAR FROM TO_TIMESTAMP(t."time", 'YYYY-MM-DD"T"HH24:MI:SS')) AS year,
            TO_CHAR(TO_TIMESTAMP(t."time", 'YYYY-MM-DD"T"HH24:MI:SS'), 'MM') AS month,
            t.location_id,
            COUNT(t.dwell) AS dwell_count
        FROM 
            public."TransponderPing" t
        JOIN 
            public."Vessel" v 
        ON 
            t.vessel_id = v.id
        WHERE 
             v.id = t.vessel_id and
            t.vessel_id in ('roachrobberdb6', 'snappersnatcher7be', 'wavewranglerc2d','arcticgraylingangler094',
            'pompanoplunderere5d',
            'bigeyetunabanditb73',
            'europeanseabassbuccaneer777',
            'huron1b3',
            'plaiceplundererba1',
            'whitemarlinwranglerbac',
            'catfishcapturer7a8',
            'whitemarlinwranglerbac',
            'opheliacac')
        GROUP BY 
            year, month, t.location_id
        ORDER BY 
            year, month;
        """
        with connection.cursor() as cursor:
            cursor.execute(raw_sql)
            rows = cursor.fetchall()

        result = [
            {
                "year": row[0],
                "week": row[1],
                "location_id": row[2],
                "dwell_count": row[3]
            }
            for row in rows
        ]

        return JsonResponse(result, safe=False)
    

class CombinedQueryView(View):
    def get(self, request, *args, **kwargs):
        raw_sql = """
       WITH first_query AS (
    SELECT 
        DISTINCT(tr.report_id), 
        CAST(d.qty_tons AS FLOAT) as ton,
        l.id AS location_id, 
        d.date, 
        ft.name AS fish_type_name
    FROM 
        public."Location_Activities" la
    JOIN 
        public."Fish_Location" fl ON la.location_id = fl.location_id
    JOIN 
        public."Fish_Type" ft ON ft.id = fl.fish_id
    JOIN 
        public."Transaction" tr ON tr.target = ft.id
    JOIN 
        public."Delivery_Report" d ON d.id = tr.report_id
    JOIN 
        public."Transaction" t2 ON tr.report_id = t2.report_id
    JOIN 
        public."Location" l ON t2.target = l.id
    WHERE 
        la.activity NOT IN ('Deep Sea Fishing', 'Commercial Fishing')
        AND ft.name NOT IN (
            SELECT ft2.name 
            FROM public."Location_Activities" la2
            JOIN public."Fish_Location" fl2 ON la2.location_id = fl2.location_id
            JOIN public."Fish_Type" ft2 ON ft2.id = fl2.fish_id
            WHERE la2.activity IN ('Deep Sea Fishing', 'Commercial Fishing')
            GROUP BY ft2.name
        )
        AND CAST(d.qty_tons AS FLOAT) > 0
    ORDER BY 
        d.date DESC
),
second_query AS (
SELECT 
        d.id AS report_id, 
        v.id AS vessel_id, 
        v.name AS vessel_name, 
        t.location_id, 
        tr.date, 
        t."time", 
        t.date_added, 
        tr.target
	FROM public."TransponderPing" as t,  public."Vessel" as v, public."Delivery_Report" as d,
	public."Transaction" as tr where 
	d.id=tr.report_id and
	tr.target=t.location_id and 
	t."time" between tr.date and to_char(TO_DATE(tr.date,'YYYY-MM-DD')+1, 'YYYY-MM-DD')
	and t.vessel_id=v.id 
	and v.type='Entity.Vessel.CargoVessel' 
)

SELECT 
    fq.report_id, 
    fq.ton, 
    fq.location_id, 
    fq.date, 
    fq.fish_type_name, 
    sq.vessel_id, 
    sq.vessel_name
FROM 
    first_query fq
LEFT JOIN 
    second_query sq ON fq.report_id = sq.report_id;
        """
        with connection.cursor() as cursor:
            cursor.execute(raw_sql)
            rows = cursor.fetchall()

        result = [
            {
                "report_id": row[0],
                "ton": row[1],
                "location_id": row[2],
                "date": row[3],
                "fish_type_name": row[4],
                "vessel_id": row[5],
                "vessel_name": row[6],
            }
            for row in rows
        ]

        return JsonResponse(result, safe=False)


