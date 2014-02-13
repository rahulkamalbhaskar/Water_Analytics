create database HydroData;
use HydroData;

Create Table Station
(
STATION_ID	varchar(10) NOT NULL Primary KEY,
STATION_NAME varchar(255)NOT NULL,
STAION_LONGITUDE real,
STATION_LATIITUDE real,
STATION_TYPE varchar(10) NOT null check(STATION_TYPE IN('Weather','Gauge'))
);

Create Table Weather
(
WINDSPEED float,
WINDSPEED_MEASUREMENT_UNIT varchar(10) NOT null check(WINDSPEED_MEASUREMENT_UNIT IN('knots','beaufort','kmh','mph','ms')),
TEMPRATURE	real,
TEMPRATURE_MEASUREMENT_UNIT varchar(10) NOT null check(TEMPRATURE_MEASUREMENT_UNIT IN('C','F')),
MEASUREMENT_DATE DATE NOT NULL,
MEASUREMENT_HOUR TIME NOT NULL,
STATION_ID varchar(10) NOT null foreign key references Station(STATION_ID),
Constraint pk_weatherId PRIMARY KEY (STATION_ID,MEASUREMENT_DATE,MEASUREMENT_HOUR) 
);

Create Table Rainfall
(
RAINFALL float,
RAINFALL_MEASUREMENT_UNIT varchar(10) NOT null check(RAINFALL_MEASUREMENT_UNIT IN('mm','inches')),
WATERLEVEL	real,
WATERLEVEL_MEASUREMENT_UNIT varchar(10) NOT null check(WATERLEVEL_MEASUREMENT_UNIT IN('M','CM')),
MEASUREMENT_DATE DATE NOT NULL,
MEASUREMENT_HOUR TIME NOT NULL,
STATION_ID varchar(10) NOT null foreign key references Station(STATION_ID),
Constraint pk_rainfallID PRIMARY KEY (STATION_ID,MEASUREMENT_DATE,MEASUREMENT_HOUR) 
);


Create Table SNOWFALL
(
SNOWFALL float,
SNOWFALL_MEASUREMENT_UNIT varchar(10) NOT null check(SNOWFALL_MEASUREMENT_UNIT IN('CM','MM','INCHES')),
SNOW_EQUIVALENT_WATER	real,
SNOW_EQUIVALENT_WATER_MEASUREMENT_UNIT varchar(10) NOT null check(SNOW_EQUIVALENT_WATER_MEASUREMENT_UNIT IN('CM','MM','INCHES')),
MEASUREMENT_DATE DATE NOT NULL,
MEASUREMENT_HOUR TIME NOT NULL,
STATION_ID varchar(10) NOT null foreign key references Station(STATION_ID),
Constraint pk_snowfallID PRIMARY KEY (STATION_ID,MEASUREMENT_DATE,MEASUREMENT_HOUR) 
);


