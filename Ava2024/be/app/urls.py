from django.urls import path
from .views import LocationActivitiesAPIView, TransponderPingCountView, HarborReportView,CargoVesselView,CargoPossibleIllegalFishing,TrendDataView,CombinedQueryView, TrendLineView

urlpatterns = [
    path('', LocationActivitiesAPIView.as_view()),
    path('transponder-pings/', TransponderPingCountView.as_view()),
    path('harbor-reports/', HarborReportView.as_view()),
    path('cargo-vessel/', CargoVesselView.as_view()),
    path('fishing/', CargoPossibleIllegalFishing.as_view()),
    path('trend-data/', TrendDataView.as_view()),
    path('trend-line/', TrendLineView.as_view()),
    path('combined/', CombinedQueryView.as_view())
]