use HydroData;
select * from Station;
--if want to upload single station
insert into HydroData.dbo.Station 
values (3031093,'CALGARY INTL A',	51.11388889,	-114.0202778,	'Weather');
delete from Station where Station.STATION_ID = '3031093';
--If want to upload CSV in Table
BULK INSERT HydroData.dbo.Station  -- your target table here (db).(schema).(tablename)
FROM 'C:\Users\Rahul\Desktop\Analytics_Coure_project\WeatherStationData.csv'    -- that's the path to your file with the data
WITH
(
    DATAFILETYPE = 'char',
    FIELDTERMINATOR =',',
    ROWTERMINATOR = '\n'
);