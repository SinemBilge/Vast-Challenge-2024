from django.db import models

class LocationActivities(models.Model):
    activity = models.TextField(null=True, blank=True)
    location_id = models.TextField(null=True, blank=True)
    class Meta:
            db_table = 'Location_Activities'

class Vessel(models.Model):
    id = models.TextField(primary_key=True, max_length=50)
    name = models.TextField(max_length=255)
    type = models.TextField(max_length=255)
    class Meta:
            db_table = 'Vessel'

class Location(models.Model):
    id = models.TextField(primary_key=True, max_length=50)
    name = models.TextField(null=True, blank=True)
    class Meta:
            db_table = 'Location'

class TransponderPing(models.Model):
    id = models.TextField(primary_key=True, max_length=50)
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE) 
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    dwell = models.TextField(null=True, blank=True)
    date_added = models.TextField(null=True, blank=True)
    class Meta:
            db_table = 'TransponderPing'

class HarborReport(models.Model):
    id = models.TextField(primary_key=True, max_length=50)
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE)  
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    date = models.TextField(null=True, blank=True)
    date_added = models.TextField(null=True, blank=True)
    class Meta:
            db_table = 'Harbor_Report'