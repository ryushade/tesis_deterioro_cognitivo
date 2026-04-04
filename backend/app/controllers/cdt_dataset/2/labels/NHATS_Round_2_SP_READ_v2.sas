/* NHATS_Round_2_SP_Read_v2.SAS - Public Use */

/* Section #1 - Creating the Formats */

PROC FORMAT;
 
	VALUE release
        1 = '1 - Main Sample'
        2 = '2 - Reserve Sample'
        9 = '9 - New Release Sample';

	VALUE STAT_DTa
          4 = " 4 April"
          5 = " 5 May"
          6 = " 6 June"
          7 = " 7 July"
          8 = " 8 August"
          9 = " 9 September"
         10 = "10 October"
         11 = "11 November"
         99 = "99 Prior to start of field work"
         -1 = '-1 - Inapplicable';

    VALUE $DISP
          '10' = "10 Not Available "
          '11' = "11 Ready"
          '12' = "12 Started "
          '20' = "20 Final "
          '24' = "24 Not Required "
          '60' = "60 Complete "
          '61' = "61 Complete, NH facility"
          '62' = "62 Complete SP Deceased, Proxy Intv"
          '63' = "63 Complete SP, FQ not complete"
          '64' = "64 Complete FQ, SP not complete"
          '75' = "75 Physically/mentally unable to participate, no proxy"
          '76' = "76 Too ill to participate, no proxy"
          '77' = "77 Refusal, SP"
          '78' = "78 Language barrier"
          '79' = "79 Unable to locate"
          '80' = "80 Unavailable during field period"
          '82' = "82 Outside of PSU"
          '83' = "83 Ineligible"
          '85' = "85 Refusal, facility"
          '86' = "86 Deceased"
          '87' = "87 Refusal, proxy"
          '88' = "88 Work stopped"    ;

VALUE DISP_a
          10 = "10 Not Available"
          11 = "11 Ready"
          12 = "12 Started"
          20 = "20 Final"
          24 = "24 Not Required"
          60 = "60 Complete"
          61 = "61 Complete, NH facility"
          62 = "62 Complete SP Deceased, Proxy Intv"
          63 = "63 Complete SP, FQ not complete"
          64 = "64 Complete FQ, SP not complete "
          75 = "75 Physically/mentally unable to participate, no proxy"
          76 = "76 Too ill to participate, no proxy"
          77 = "77 Refusal, SP"
          78 = "78 Language barrier"
          79 = "79 Unable to locate"
          80 = "80 Unavailable during field period"
          82 = "82 Outside of PSU"
          83 = "83 Ineligible"
          85 = "85 Refusal, facility"
          86 = "86 Deceased"
          87 = "87 Refusal, proxy"
          88 = "88 Work stopped"    ;

    VALUE DISP_
          10 = "10 Not Available"
          11 = "11 Ready"
          12 = "12 Started"
          20 = "20 Final"
          24 = "24 Not Required";

    VALUE DISP_F
     -1 = '-1 Inapplicable'
          10 = "10 Not Available"
          11 = "11 Ready"
          12 = "12 Started"
          20 = "20 Final"
          24 = "24 Not Required"
          60 = "60 Complete"
          61 = "61 Complete, NH facility"
          62 = "62 Complete SP Deceased, Proxy Intv"
          63 = "63 Complete SP, FQ not complete"
          64 = "64 Complete FQ, SP not complete "
          75 = "75 Physically/mentally unable to participate, no proxy"
          76 = "76 Too ill to participate, no proxy"
          77 = "77 Refusal, SP"
          78 = "78 Language barrier"
          79 = "79 Unable to locate"
          80 = "80 Unavailable during field period"
          82 = "82 Outside of PSU"
          83 = "83 Ineligible"
          85 = "85 Refusal, facility"
          86 = "86 Deceased"
          87 = "87 Refusal, proxy"
          88 = "88 Work stopped"   
		  89 = "89 Final, Other Specify";

    VALUE RFDK
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable (nursing home resident or residential care no FQ)'
    -9 = '-9 Missing';

    VALUE $RFDK_F
    '-7' = '-7 RF'
    '-8' = '-8 DK'
    '-1' = '-1 Inapplicable'
    '-9' = '-9 Missing';

    VALUE RFDK_F
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

VALUE RFDK_B
	-1 = '-1 Inapplicable'
	1 = '1 Yes-Breakoff';

VALUE $RFDK_C
    '-1' = '-1 Inapplicable'
    'CL' ='CL - Closing'
    'EW' ='EW - Economic Well-Being'
    'FQ' ='FQ - Facility Questionnaire'
    'HL' ='HL - Helper'
    'HW' ='HW - Height and Weight'
    'IP' ='IP - Insurance Plans'
    'LF' ='LF - Labor Force'
    'PA' ='PA - Participation'
    'PE' ='PE - Performance'
    'WB' ='WB - Well-being' ;

VALUE $RFDK_2C
    '-1' = '-1 Inapplicable'
    '-7' = '-7 RF'
    '-8' = '-8 DK'
    '-9' = '-9 Missing'; 

    VALUE RFDK_Y
     1 = ' 1 Yes'
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

    VALUE RFDK_YN
     1 = ' 1 Yes'
     2 = ' 2 No'
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

    VALUE DSTRP_G
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing'
    1 =  '1 X condition and word color condition accuracy below threshold (less than .42)'
    2 =  '2 word condition only below threshold (less than .42)'
    3 =  '3 X condition and word color condition meet criteria for accuracy'
    4 =  '4 fewer than 50% of X and word color condition trials answered'
    999 = '999 X condition only below threshold (less than .42)';

    VALUE DSTRP_R
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -999 = '-999 Inapplicable'
    other = 'Values ranging between -.353 and 1.115';

    VALUE DSTRP_M
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -999 = '-999 Inapplicable'
    other = 'Values ranging between -544.732 and 924.863';

VALUE FQ_4F
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
          1='1 YES'
          2='2 NO';

  VALUE CHILDDEC
    1 =  '1 CHILD DECEASED'
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

  VALUE W200001W
    12 = "12 STARTED"
    20 = "20 COMPLETE"
    21 = "21 INELIGIBLE - NOT 65+"   ;

  VALUE W200008x
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 UNDER 20"
    2 = "2 20-24"
    3 = "3 25-29"
    4 = "4 30-34"
    5 = "5 35-39"
    6 = "6 40-44"
    7 = "7 45-49"
    8 = "8 50-54"
    9 = "9 55-59"
    10 = "10 60-64"
    11 = "11 65-69"
    12 = "12 70-74"
    13 = "13 75-79"
    14 = "14 80-84"
    15 = "15 85-89"
    16 = "16 90 +";

  VALUE W200009W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 SAMPLE PERSON"
    2 = "2 SPOUSE/ PARTNER"
    3 = "3 DAUGHTER"
    4 = "4 SON"
    5 = "5 DAUGHTER-IN-LAW"
    6 = "6 SON-IN-LAW"
    7 = "7 STEPDAUGHTER"
    8 = "8 STEPSON"
    9 = "9 SISTER"
    10 = "10 BROTHER"
    11 = "11 SISTER-IN-LAW"
    12 = "12 BROTHER-IN-LAW"
    13 = "13 MOTHER"
    14 = "14 STEPMOTHER"
    15 = "15 MOTHER-IN-LAW"
    16 = "16 FATHER"
    17 = "17 STEPFATHER"
    18 = "18 FATHER-IN-LAW"
    19 = "19 GRANDDAUGHTER"
    20 = "20 GRANDSON"
    21 = "21 NIECE"
    22 = "22 NEPHEW"
    23 = "23 AUNT"
    24 = "24 UNCLE"
    25 = "25 COUSIN"
    26 = "26 STEPDAUGHTER'S SON/ DAUGHTER"
    27 = "27 STEPSON'S SON/ DAUGHTER"
    28 = "28 DAUGHTER-IN-LAW'S SON/ DAUGHTER"
    29 = "29 SON-IN-LAW'S SON/ DAUGHTER"
    30 = "30 BOARDER/RENTER"
    31 = "31 PAID AIDE/ HOUSEKEEPER/ EMPLOYEE"
    32 = "32 ROOMMATE"
    33 = "33 EX-WIFE/ EX-HUSBAND"
    34 = "34 BOYFRIEND/ GIRLFRIEND"
    35 = "35 NEIGHBOR"
    36 = "36 FRIEND"
    37 = "37 SOMEONE/SERVICE AT THE PLACE SP LIVES/LIVED"
    38 = "38 CO-WORKER"
    39 = "39 MINISTER, PRIEST, OR OTHER CLERGY"
    40 = "40 PSYCHIATRIST, PSYCHOLOGIST, COUNSELOR, OR THERAPIST"
    41 = "41 DECEASED SPOUSE/PARTNER"
    91 = "91 OTHER RELATIVE"
    92 = "92 OTHER NONRELATIVE"   ;

   VALUE W200002W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 MALE"
    2 = "2 FEMALE";

   VALUE W200005W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 NO SCHOOLING COMPLETED"
    2 = "2 1ST-8TH GRADE"
    3 = "3 9TH-12TH GRADE (NO DIPLOMA)"
    4 = "4 HIGH SCHOOL GRADUATE (HIGH SCHOOL DIPLOMA OR EQUIVALENT)"
    5 = "5 VOCATIONAL, TECHNICAL, BUSINESS, OR TRADE SCHOOL CERTIFICATE OR DIPLOMA (BEYOND HIGH SCHOOL LEVEL)"
    6 = "6 SOME COLLEGE BUT NO DEGREE"
    7 = "7 ASSOCIATE'S DEGREE"
    8 = "8 BACHELOR'S DEGREE"
    9 = "9 MASTER'S, PROFESSIONAL, OR DOCTORAL DEGREE"  ;

  VALUE W200010W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 MARRIED"
    2 = "2 LIVING WITH A PARTNER"
    3 = "3 SEPARATED"
    4 = "4 DIVORCED"
    5 = "5 WIDOWED"
    6 = "6 NEVER MARRIED";

  VALUE W200011W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 YES"
    2 = "2 NO"
    7 = "7 PREVIOUSLY REPORTED"  ;
VALUE W200012W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 REGULAR"
    2 = "2 VARIED"  ;

   VALUE W200013W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 SP AND/OR FAMILY"
    2 = "2 GOVERNMENT PROGRAM"
    3 = "3 INSURANCE"
    91 = "91 OTHER (SPECIFY)"   ;

  VALUE W200015W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1='1 HOURLY'
    2='2 WEEKLY'
    3='3 MONTHLY'
    4='4 DID NOT PAY IN LAST MONTH';

  VALUE W200016W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 MEDICAID"
    2 = "2 MEDICARE"
    3 = "3 STATE PROGRAM"
    91 = "91 OTHER (SPECIFY)"   ;

  VALUE W200018W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 FREE-STANDING (DETACHED) SINGLE HOUSE"
    2 = "2 SINGLE HOUSE BUT ATTACHED TO OTHERS (ROW HOUSE, TOWNHOUSE, DUPLEX, TRIPLEX, OR TRIPLE DECKER)"
    3 = "3 MOBILE HOME OR TRAILER"
    4 = "4 MULTI-UNIT (2+) BUILDING"
    91 = "91 OTHER (SPECIFY)"  ;

  VALUE W200020W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 HOME"
    2 = "2 MULTI-UNIT"
    3 = "3 OTHER"  ;

  VALUE W200021W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 BUILDING HAS ONE FLOOR"
    2 = "2 BUILDING HAS MULTIPLE FLOORS"   ;

  VALUE W200022W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 HOME"
    2 = "2 APARTMENT"
    3 = "3 ROOM"
    4 = "4 UNIT"
    5 = "5 SUITE"
    6 = "6 SOMETHING ELSE (SPECIFY)"  ;

  VALUE W200030W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 SAMPLE PERSON (SP)"
    2 = "2 PROXY"  ;

  VALUE W200032W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 HOSPITAL"
    2 = "2 NURSING HOME/REHAB CENTER"
    91 = "91 OTHER (SPECIFY)"  ;

  VALUE W200035W
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 SELF"
    2 = "2 SPOUSE/ PARTNER"
    3 = "3 DAUGHTER"
    4 = "4 SON"
    5 = "5 DAUGHTER-IN-LAW"
    6 = "6 SON-IN-LAW"
    7 = "7 STEPDAUGHTER"
    8 = "8 STEPSON"
    9 = "9 SISTER"
    10 = "10 BROTHER"
    11 = "11 SISTER-IN-LAW"
    12 = "12 BROTHER-IN-LAW"
    13 = "13 MOTHER"
    14 = "14 STEPMOTHER"
    15 = "15 MOTHER-IN-LAW"
    16 = "16 FATHER"
    17 = "17 STEPFATHER"
    18 = "18 FATHER-IN-LAW"
    19 = "19 GRANDDAUGHTER"
    20 = "20 GRANDSON"
    21 = "21 NIECE"
    22 = "22 NEPHEW"
    23 = "23 AUNT"
    24 = "24 UNCLE"
    25 = "25 COUSIN"
    26 = "26 STEPDAUGHTER'S SON/ DAUGHTER"
    27 = "27 STEPSON'S SON/ DAUGHTER"
    28 = "28 DAUGHTER-IN-LAW'S SON/ DAUGHTER"
    29 = "29 SON-IN-LAW'S SON/ DAUGHTER"
    30 = "30 BOARDER/RENTER"
    31 = "31 PAID AIDE/ HOUSEKEEPER/ EMPLOYEE"
    32 = "32 ROOMMATE"
    33 = "33 EX-WIFE/ EX-HUSBAND"
    34 = "34 BOYFRIEND/ GIRLFRIEND"
    35 = "35 NEIGHBOR"
    36 = "36 FRIEND"
    37 = "37 SOMEONE/SERVICE FROM THE PLACE SP LIVES/DIED"
    38 = "38 CO-WORKER"
    39 = "39 MINISTER, PRIEST, OR OTHER CLERGY"
    40 = "40 PSYCHIATRIST, PSYCHOLOGIST, COUNSELOR, OR THERAPIST"
    91 = "91 OTHER RELATIVE"
    92 = "92 OTHER NONRELATIVE"  ;

  VALUE W200036W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 VERY FAMILIAR"
    2 = "2 SOMEWHAT FAMILIAR"
    3 = "3 A LITTLE FAMILIAR"
    4 = "4 NOT AT ALL FAMILIAR"  ;

  VALUE W200037W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 YES, SAME ADDRESS"
    2 = "2 NO, DIFFERENT ADDRESS"
    3 = "3 YES, SAME ADDRESS WITH MINOR CORRECTIONS"  ;

  VALUE W200038W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 JANUARY"
    2 = "2 FEBRUARY"
    3 = "3 MARCH"
    4 = "4 APRIL"
    5 = "5 MAY"
    6 = "6 JUNE"
    7 = "7 JULY"
    8 = "8 AUGUST"
    9 = "9 SEPTEMBER"
    10 = "10 OCTOBER"
    11 = "11 NOVEMBER"
    12 = "12 DECEMBER"  ;

  VALUE W200039W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 2011"
    2 = "2 2012"
    3 = "3 YEAR2013"
    4 = "4 YEAR2014"
    5 = "5 YEAR2015"
    6 = "6 YEAR2016"
    7 = "7 YEAR2017"
    8 = "8 YEAR2018"
    9 = "9 YEAR2019"
    10 = "10 YEAR2020"  ;

  VALUE W200040W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 2011"
    2 = "2 2012"  ;

  VALUE W200041W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 AT SPS OR SOMEONE ELSES HOME"
    2 = "2 IN A HOSPITAL"
    3 = "3 IN A NURSING HOME"
    4 = "4 IN A HOSPICE RESIDENCE"
    5 = "5 IN TRANSIT (AMBULANCE TO HOSPITAL)"
    91 = "91 SOMEWHERE ELSE (SPECIFY)";

  VALUE W200042W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 SP'S HOME"
    2 = "2 SOMEONE ELSE'S HOME"  ;

  VALUE W200043W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 INTENSIVE CARE UNIT"
    2 = "2 PALLIATIVE CARE UNIT"
    3 = "3 INPATIENT HOSPICE UNIT"
    4 = "4 EMERGENCY ROOM"
    5 = "5 ANOTHER KIND OF UNIT"  ;

  VALUE W200044W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 HOSPICE AT A HOSPITAL"
    2 = "2 HOSPICE AT A NURSING HOME"
    3 = "3 RESIDENTIAL HOSPICE"
    4 = "4 OTHER HOSPICE"  ;

  VALUE W200045W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 DAYS"
    2 = "2 WEEKS"
    3 = "3 MONTHS"
    4 = "4 YEARS"  ;

  VALUE W200046W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 AT SP'S HOME"
    2 = "2 IN A HOSPITAL"
    3 = "3 IN A NURSING HOME"
    4 = "4 IN A HOSPICE RESIDENCE"
    91 = "91 SOMEWHERE ELSE (SPECIFY)"  ;

  VALUE W200047W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 EVERY DAY"
    2 = "2 MOST DAYS"
    3 = "3 SOME DAYS"
    4 = "4 RARELY"
    5 = "5 NOT AT ALL"  ;

  VALUE W200048W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 LESS THAN WAS NEEDED"
    2 = "2 MORE THAN WAS NEEDED"
    3 = "3 ABOUT RIGHT AMOUNT"  ;

  VALUE W200049W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 YES"
    2 = "2 NO"
    3 = "3 DOES NOT APPLY/NO CARE IN LAST MONTH OF LIFE"  ;

  VALUE W200050W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 ALWAYS"
    2 = "2 USUALLY"
    3 = "3 SOMETIMES"
    4 = "4 NEVER"
    5 = "5 DOES NOT APPLY/NO CARE IN LAST MONTH OF LIFE"  ;

  VALUE W200051W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 EXCELLENT"
    2 = "2 VERY GOOD"
    3 = "3 GOOD"
    4 = "4 FAIR"
    5 = "5 POOR"  ;

  VALUE W200052W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 NOT AT ALL"
    2 = "2 SEVERAL DAYS"
    3 = "3 MORE THAN HALF THE DAYS"
    4 = "4 NEARLY EVERY DAY"  ;

  VALUE W200053W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 EVERY NIGHT (7 NIGHTS A WEEK)"
    2 = "2 MOST NIGHTS (5-6 NIGHTS A WEEK)"
    3 = "3 SOME NIGHTS (2-4 NIGHTS A WEEK)"
    4 = "4 RARELY (ONCE A WEEK OR LESS)"
    5 = "5 NEVER"  ;

  VALUE W200054W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 EVERY NIGHT (7 NIGHTS A WEEK)"
    2 = "2 MOST NIGHTS (5-6 NIGHTS A WEEK)"
    3 = "3 SOME NIGHTS (2-4 NIGHTS A WEEK)"
    4 = "4 RARELY (ONCE A WEEK OR LESS)"
    5 = "5 NEVER"
    7 = "7 DON'T WAKE UP/NOT A PROBLEM"  ;

  VALUE W200055W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 PRIVATE RESIDENCE"
    2 = "2 A GROUP HOME, BOARD AND CARE, OR SUPERVISED HOUSING"
    3 = "3 ASSISTED LIVING FACILITY OR CONTINUING CARE RETIREMENT COMMUNITY (CCRC)"
    4 = "4 RELIGIOUS GROUP QUARTERS"
    91 = "91 OTHER (SPECIFY)"  ;

  VALUE W200056W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 YES"
    2 = "2 NO"
    7 = "7 PLACE DOES NOT HAVE A NAME"  ;

  VALUE W200057W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 APARTMENT"
    2 = "2 ROOM"
    3 = "3 UNIT"
    4 = "4 SUITE"
    91 = "91 SOMETHING ELSE (SPECIFY)"  ;

  VALUE W200058W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 YES"
    2 = "2 NO, DIFFERENT PERSON"
    3 = "3 NO, NAME MISSPELLED"  ;

   VALUE W200060W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 PRIVATE RESIDENCE"
    2 = "2 A GROUP HOME, BOARD AND CARE, OR SUPERVISED HOUSING"
    3 = "3 ASSISTED LIVING FACILITY OR CONTINUING CARE RETIREMENT COMMUNITY (CCRC)"
    5 = "5 NURSING HOME"
    91 = "91 OTHER (SPECIFY)"  ;

  VALUE W200061W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 SEPARATION OR DIVORCE"
    2 = "2 DECEASED"
    3 = "3 MOVED ELSEWHERE"
    5 = "5 LAST INTERVIEW INFORMATION INCORRECT"
    8 = "8 OTHER REASON"   ;

  VALUE W200067W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 COMMON OR SHARED ENTRANCE"
    2 = "2 ENTRANCE DIRECTLY INTO HOME"  ;

  VALUE W200068W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1"
    2 = "2"
    3 = "3"
    4 = "4+"  ;

  VALUE W200069W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 ALL ITEMS HERE"
    2 = "2 ADDED ONE OR MORE ITEMS"  ;

  VALUE W200070W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 MORE THAN $500"
    2 = "2 LESS THAN $500"
    3 = "3 JUST ABOUT $500"  ;

  VALUE W200071W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 MORE THAN $1,000"
    2 = "2 LESS THAN $1,000"
    3 = "3 JUST ABOUT $1,000"  ;

  VALUE W200072W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 MORE THAN $100"
    2 = "2 LESS THAN $100"
    3 = "3 JUST ABOUT $100"  ;

  VALUE W200073W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 YES"
    2 = "2 NO"
    7 = "7 YES, DOESNT KNOW HOW TO USE A COMPUTER"  ;

  VALUE W200074W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 MOST DAYS"
    2 = "2 SOME DAYS"
    3 = "3 RARELY"  ;

  VALUE W200076W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 YES"
    2 = "2 NO"
    7 = "7 DEAF"  ;

  VALUE W200077W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 YES"
    2 = "2 NO"
    7 = "7 BLIND"  ;

  VALUE W200078W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 EVERY DAY (7 DAYS A WEEK)"
    2 = "2 MOST DAYS (5-6 DAYS A WEEK)"
    3 = "3 SOME DAYS (2-4 DAYS A WEEK)"
    4 = "4 RARELY (ONCE A WEEK OR LESS)"
    5 = "5 NEVER"  ;

  VALUE W200080W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 YES, A CHANGE"
    2 = "2 NO, NO CHANGE"
    3 = "3 DEMENTIA/ALZHEIMER'S REPORTED BY PROXY"  ;

  VALUE W200081W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 SP HAS DEMENTIA/ALZHEIMER'S/ NOT ABLE"
    2 = "2 SP IS UNABLE TO SPEAK"
    3 = "3 SP IS UNABLE TO HEAR"
    4 = "4 SP REFUSED"
    5 = "5 PROXY REFUSED"
    6 = "6 SP NOT PRESENT"
    7 = "7 SP TOO ILL"
    8 = "8 SP LANGUAGE BARRIER"
    91 = "91 OTHER (SPECIFY)"  ;

  VALUE W200082W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 MUCH BETTER"
    2 = "2 BETTER"
    3 = "3 SAME"
    4 = "4 WORSE"
    5 = "5 MUCH WORSE"  ;

  VALUE W200083W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 YES"
    2 = "2 NO/DON'T KNOW"  ;

  VALUE W200084W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 CONTINUE WITH ACTIVITY"
    2 = "2 SP REFUSES ACTIVITY"  ;

  VALUE W200085W
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "Word[1]"
    2 = "Word[2]"
    3 = "Word[3]"
    4 = "Word[4]"
    5 = "Word[5]"
    6 = "Word[6]"
    7 = "Word[7]"
    8 = "Word[8]"
    9 = "Word[9]"
    10 = "Word[10]"
    91 = "91 NO WORDS REMEMBERED"
    92 = "92 REFUSED"  ;

  VALUE W200086W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 DIFFICULTY HEARING ANY OF THE WORDS"
    2 = "2 INTERRUPTION OCCURRED WHILE LIST WAS BEING READ"
    91 = "91 OTHER PROBLEM (SPECIFY)"
    92 = "92 NO PROBLEMS OCCURRED"
    97 = "97 SP REFUSED WORD RECALL TASK"  ;

  VALUE W200087W
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 SP ATTEMPTED CLOCK DRAWING"
    2 = "2 SP DID NOT ATTEMPT CLOCK DRAWING"
    97 = "3 SP REFUSED CLOCK DRAWING"  ;

  VALUE W200089W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 EVERY DAY (7 DAYS A WEEK)"
    2 = "2 MOST DAYS (5-6 DAYS A WEEK)"
    3 = "3 SOME DAYS (2-4 DAYS A WEEK)"
    4 = "4 RARELY (ONCE A WEEK OR LESS)"
    5 = "5 NEVER"  ;

  VALUE W200090W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 EVERY TIME"
    2 = "2 MOST TIMES"
    3 = "3 SOMETIMES"
    4 = "4 RARELY"
    5 = "5 NEVER"  ;

  VALUE W200092W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 MOST TIMES"
    2 = "2 SOMETIMES"
    3 = "3 RARELY"
    4 = "4 NEVER"  ;

  VALUE W200093W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 NONE"
    2 = "2 A LITTLE"
    3 = "3 SOME"
    4 = "4 A LOT"  ;

  VALUE W200094W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 MORE OFTEN"
    2 = "2 LESS OFTEN"
    3 = "3 ABOUT THE SAME"  ;

  VALUE W200095W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 JANUARY"
    2 = "2 FEBRUARY"
    3 = "3 MARCH"
    4 = "4 APRIL"
    5 = "5 MAY"
    6 = "6 JUNE"
    7 = "7 JULY"
    8 = "8 AUGUST"
    9 = "9 SEPTEMBER"
    10 = "10 OCTOBER"
    11 = "11 NOVEMBER"
    12 = "12 DECEMBER"
    90 = "90 LAST INTERVIEW INFORMATION INCORRECT"  ;

  VALUE W200096W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 YES"
    2 = "2 NO"
    90 = "90 LAST INTERVIEW INFORMATION INCORRECT"  ;

  VALUE W200097W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 YES"
    2 = "2 NO / NO LONGER DRIVE"  ;

  VALUE W200098W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 YES"
    2 = "2 NO"
    7 = "7 NO, NO RAIN OR BAD WEATHER"  ;

  VALUE W200099W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 ALWAYS DID IT BY SELF"
    2 = "2 ALWAYS DID IT TOGETHER WITH SOMEONE ELSE"
    3 = "3 SOMEONE ELSE ALWAYS DID IT"
    4 = "4 IT VARIED (MORE THAN ONE WAY)"
    5 = "5 NOT DONE IN LAST MONTH"  ;

  VALUE W200102W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 MORE OFTEN"
    2 = "2 LESS OFTEN"
    3 = "3 SAME"  ;

  VALUE W200106W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 YES"
    2 = "2 NO"
    7 = "7 ALWAYS FED THROUGH IV OR TUBE"  ;

  VALUE W200107W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 EVERY TIME"
    2 = "2 MOST TIMES"
    3 = "3 SOMETIMES"
    4 = "4 RARELY"  ;

  VALUE W200109W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 SHOWERING"
    2 = "2 TAKING BATHS"
    3 = "3 WASHING UP SOME OTHER WAY"  ;


  VALUE W200114W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 VERY IMPORTANT"
    2 = "2 SOMEWHAT IMPORTANT"
    3 = "3 NOT SO IMPORTANT"  ;

  VALUE W200115W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 YES"
    2 = "2 NO"
    95 = "95 NO ACTIVITY LISTED"  ;

  VALUE W200116W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 LEFT"
    2 = "2 RIGHT"
    3 = "3 BOTH"  ;

  VALUE W200117W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 LEFT SIDE"
    2 = "2 RIGHT SIDE"
    3 = "3 BOTH SIDES"  ;

  VALUE W200118W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 ONE SIDE"
    2 = "2 BOTH SIDES"  ;

  VALUE W200119W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 RECEIVE ALL TREATMENTS"
    2 = "2 STOP/REJECT ALL TREATMENTS"  ;

  VALUE W200120W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 LIVING IN THEIR OWN HOME WITH HELP FROM FRIENDS AND FAMILY"
    2 = "2 LIVING IN THEIR OWN HOME WITH HELP FROM SOMEONE PAID TO COME IN"
    3 = "3 LIVING WITH AN ADULT CHILD"
    4 = "4 LIVING IN AN ASSISTED LIVING FACILITY OR CONTINUING CARE RESIDENCE"
    5 = "5 LIVING IN A NURSING HOME"  ;

  VALUE W200121W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 YES"
    2 = "2 NO"
    3 = "3 DOESNT HAVE ANY MONEY TO PAY A CAREGIVER"
    4 = "4 WOULD NOT USE A PAID CAREGIVER"  ;

  VALUE W200122W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 MAKE DECISIONS WITHOUT MUCH ADVICE FROM THEM"
    2 = "2 GET THEIR ADVICE AND THEN MAKE DECISIONS"
    3 = "3 MAKE DECISIONS TOGETHER"
    4 = "4 LEAVE DECISIONS UP TO THEM"  ;

  VALUE W200123W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 HANDLE MOSTLY BY SELF"
    2 = "2 HANDLE TOGETHER WITH FAMILY OR CLOSE FRIENDS"
    3 = "3 FAMILY OR CLOSE FRIENDS MOSTLY HANDLE THESE THINGS"
    4 = "4 IT VARIES"  ;

  VALUE W200124W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 NEVER"
    2 = "2 RARELY"
    3 = "3 SOMETIMES"
    4 = "4 OFTEN"  ;

  VALUE W200126W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 AGREE A LOT"
    2 = "2 AGREE A LITTLE"
    3 = "3 DO NOT AGREE"  ;

  VALUE W200127W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 AGREE A LOT"
    2 = "2 AGREE A LITTLE"
    3 = "3 AGREE NOT AT ALL"  ;

  VALUE W200129W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 less than $1,000,"
    2 = "2 $1,000 to less than $2,000,"
    3 = "3 $2,000 to less than $3,000,"
    4 = "4 $3,000 to less than $5,000, or"
    5 = "5 $5,000 or more?"  ;

  VALUE W200131W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 YES"
    2 = "2 NO"
    3 = "3 RETIRED/DON'T WORK ANYMORE"  ;

  VALUE W200132W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 EVERY WEEK"
    2 = "2 EVERY TWO WEEKS"
    3 = "3 TWO TIMES A MONTH"
    4 = "4 ONCE A MONTH"
    5 = "5 DAILY"
    91 = "91 OTHER SCHEDULE (SPECIFY)"  ;

  VALUE W200133W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 OWN"
    2 = "2 RENT"
    3 = "3 SOME OTHER ARRANGEMENT"  ;

  VALUE W200134W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 PAID OFF"
    2 = "2 STILL MAKE PAYMENTS"
    3 = "3 REVERSE MORTGAGE"  ;

  VALUE W200135W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 less than $250,"
    2 = "2 $250-$499,"
    3 = "3 $500-$999, or"
    4 = "4 $1,000 or more?"  ;

  VALUE W200136W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 5 YEARS"
    2 = "2 10 YEARS"
    3 = "3 LONGER THAN 10 YEARS"  ;

  VALUE W200137W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 less than $50,000,"
    2 = "2 between $50,000 and $100,000, or"
    3 = "3 over $100,000?"  ;

  VALUE W200138W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 less than $50,000,"
    2 = "2 $50,000-$74,999,"
    3 = "3 $75,000-$99,999,"
    4 = "4 $100,000-$199,999,"
    5 = "5 $200,000-$299,999,"
    6 = "6 $300,000-$499,999,"
    7 = "7 $500,000-$749,999, or"
    8 = "8 $750,000 or more?"  ;

  VALUE W200139W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 PAY OFF BALANCE"
    2 = "2 PAY MINIMUM"
    3 = "3 PAY MORE THAN MINIMUM, BUT NOT ENTIRE BALANCE"
    4 = "4 DON'T HAVE ANY CREDIT CARDS"  ;

  VALUE W200140W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 less than $1,000,"
    2 = "2 $1,000 - $1,999,"
    3 = "3 $2,000 - $3,999,"
    4 = "4 $4,000 - $5,999,"
    5 = "5 $6,000 - $9,999,"
    6 = "6 $10,000 - $19,999, or"
    7 = "7 $20,000 or more?"  ;

  VALUE W200141W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 MOST"
    2 = "2 SOME"
    3 = "3 A LITTLE"  ;

  VALUE W200142W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 less than $500,"
    2 = "2 $500 - $999,"
    3 = "3 $1,000 - $1,999,"
    4 = "4 $2,000 - $3,999,"
    5 = "5 $4,000 - $5,999,"
    6 = "6 $6,000 - $9,999,"
    7 = "7 $10,000 - $19,999, or"
    8 = "8 $20,000 or more?"  ;

  VALUE W200146W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 NEARLY EVERY DAY"
    2 = "2 MORE THAN HALF THE DAYS"
    3 = "3 SEVERAL DAYS (LESS THAN HALF)"
    4 = "4 A FEW DAYS"  ;

  VALUE W200147W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 INCLUDED"
    2 = "2 EXTRA CHARGE"  ;

  VALUE W200148W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 Yes"  ;

VALUE F200006W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 FREE STANDING NURSING HOME"
    2 = "2 FREE STANDING ASSISTED LIVING FACILITY"
    3 = "3 NURSING HOME AND ASSISTED LIVING FACILITY"
    4 = "4 CONTINUING CARE RETIREMENT COMMUNITY (CCRC)"
    5 = "5 ADULT FAMILY CARE HOME"
    6 = "6 GROUP HOME"
    7 = "7 BOARD AND CARE HOME"
    8 = "8 RETIREMENT COMMUNITY OR SENIOR HOUSING (NOT CCRC)"
    91 = "91 OTHER (SPECIFY)"  ;

  VALUE F200007W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 YES"
    2 = "2 NO"  ;

  VALUE F200008W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 INDEPENDENT LIVING"
    2 = "2 ASSISTED LIVING"
    3 = "3 SPECIAL CARE, MEMORY CARE, OR ALZHEIMER'S UNIT"
    4 = "4 NURSING HOME"
    91 = "91 OTHER (SPECIFY)"  ;

  VALUE F200009W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 ASSISTED LIVING"
    2 = "2 NURSING HOME"  ;

  VALUE F200011W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 YES, SERVICE PROVIDED AS PART OF PACKAGE"
    2 = "2 YES, SERVICE PROVIDED AT AN EXTRA CHARGE"
    3 = "3 NO, SERVICE NOT PROVIDED"  ;

  VALUE F200012W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 SP/FAMILY"
    2 = "2 SOCIAL SECURITY/SSI"
    3 = "3 MEDICAID"
    4 = "4 MEDICARE"
    5 = "5 OTHER SOURCE"  ;

  VALUE I200002W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 Yes"
    2 = "2 No"  ;

  VALUE I200003W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 English"
    2 = "2 Spanish"
    3 = "3 Other (specify)"  ;

  VALUE I200005W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 Friendly and interested"
    2 = "2 Cooperative but not particularly interested"
    3 = "3 Impatient and restless"
    4 = "4 Hostile"  ;

  VALUE I200006W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 Good"
    2 = "2 Fair"
    3 = "3 Poor"  ;

  VALUE I200008W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 All of the time"
    2 = "2 Most of the time"
    3 = "3 Some of the time"
    4 = "4 Only for the cognition and/or performance parts"
    5 = "5 None of the time"  ;

   VALUE I200010W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 Yes"
    2 = "2 No"
    3 = "3 Interview was conducted by telephone"  ;

  VALUE I200012W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 Yes"
    2 = "2 No"
    3 = "3 Not Administered"  ;

  VALUE I200013W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 Yes"
    2 = "2 No"  ;

  VALUE I200016W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 Yes"
    2 = "2 No"
    3 = "3 Entire interview conducted by telephone"  ;

  VALUE I200017W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 Not at all cluttered"
    2 = "2 Somewhat cluttered"
    3 = "3 Very cluttered"
    4 = "4 Could not see other rooms"  ;

  VALUE I200018W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 None"
    2 = "2 A little"
    3 = "3 Some"
    4 = "4 A lot"
    5 = "5 Could not observe"  ;

  VALUE I200019W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 Yes"
    2 = "2 No"
    7 = "7 Could not observe"  ;


/* DERIVED VARIABLE FORMATS */
  VALUE LVGARRG
    1 = '1 Alone'
    2 = '2 With spouse/partner only (spouse/partner in household]'
    3 = '3 With spouse/partner and with others'
    4 = '4 With others only'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

  VALUE DOUTSFDF
    8 = '8 Not done in last month'
    1 = '1 Did not do by self in last month'
    2 = '2 Did by self in last month/No Difficulty'
    3 = '3 Did by self in last month/Difficulty'
    4 = '4 DKRF Did by self in last month/No Difficulty'
    5 = '5 DKRF Did by self in last month/Difficulty'
    6 = '6 Did by self in last month/DKRF Difficulty'
    7 = '7 DKRF Did by self in last month/DKRF Difficulty'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

VALUE DOUTDEVI
    8 = '8 Not done in last month'
    1 = '1 No use of devices to go outside in last month'
    2 = '2 Use of devices to go outside in last month'
    3 = '3 DKRF If used devices to go outside in last month'
    4 = '4 DKRF If used devices in last month'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

  VALUE DOUTHELP
    8 = '8 Not done in last month'
    1 = '1 NO HELP TO GO OUTSIDE IN LAST MONTH'
    2 = '2 HAD HELP TO GO OUTSIDE IN LAST MONTH'
    3 = '3 DKRF IF HAD HELP TO GO OUTSIDE IN LAST MONTH'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

  VALUE DINSDSFD
    8 = '8 Not done in last month'
    1 = '1 Did not do by self in last month'
    2 = '2 Did by self in last month/No Difficulty'
    3 = '3 Did by self in last month/Difficulty'
    4 = '4 DKRF Did by self in last month/No Difficulty'
    5 = '5 DKRF Did by self in last month/Difficulty'
    6 = '6 Did by self in last month/DKRF Difficulty'
    7 = '7 DKRF Did by self in last month/DKRF Difficulty'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

  VALUE DINSDDEV
    8 = '8 Not done in last month'
    1 = '1 No use of devices inside in last month'
    2 = '2 Use of devices inside in last month'
    3 = '3 DKRF If used devices inside in last month'
    4 = '4 DKRF On Use of devices'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

  VALUE dinsdhlp
    8 = '8 Not done in last month'
    1 = '1 No help to go around inside in last month'
    2 = '2 Had help to go around inside in last month'
    3 = '3 DKRF If had help to go around inside in last month'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

  VALUE dbedsfdf
    1 = '1 Did not do by self in last month'
    2 = '2 Did by self in last month/No Difficulty'
    3 = '3 Did by self in last month/Difficulty'
    4 = '4 DKRF Did by self in last month/No Difficulty'
    5 = '5 DKRF Did by self in last month/Difficulty'
    6 = '6 Did by self in last month/DKRF Difficulty'
    7 = '7 DKRF Did by self in last month/DKRF Difficulty'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

   VALUE dbeddevi
    1 = '1 No use of cane or walker to get out of bed in last month'
    2 = '2 Use of cane or walker to get out of bed in last month'
    3 = '3 DKRF If Used cane or walker to get out of bed in last month'
    4 = '4 DKRF If used cane or walker in last month'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

  VALUE dbedhelp
    1 = '1 No help to get out of bed in last month'
    2 = '2 Had help to get out of bed in last month'
    3 = '3 DKRF If had help to get out of bed in last month'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';


  VALUE dlaunsfd
    1 = '1 Did not do by self in last month'
    2 = '2 Did by self in last month/No Difficulty'
    3 = '3 Did by self in last month/Difficulty'
    4 = '4 DKRF Did by self in last month/No Difficulty'
    5 = '5 DKRF Did by self in last month/Difficulty'
    6 = '6 Did by self in last month/DKRF Difficulty'
    7 = '7 DKRF Did by self in last month/DKRF Difficulty'
    8 = '8 Not done in last month'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';



  VALUE dlaunrea
    1= '1 Health/functioning reason only'
    2= '2 Other reason only'
    3= '3 Both health/functioning and other'
    4= '4 Service/someone from the place SP lives'
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

  VALUE dshopsfd
    1 = '1 Did not do by self in last month'
    2 = '2 Did by self in last month/No Difficulty'
    3 = '3 Did by self in last month/Difficulty'
    4 = '4 DKRF Did by self in last month/No Difficulty'
    5 = '5 DKRF Did by self in last month/Difficulty'
    6 = '6 Did by self in last month/DKRF Difficulty'
    7 = '7 DKRF Did by self in last month/DKRF Difficulty'
    8 = '8 Not done in last month'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

  VALUE dshoprea
    1= '1 Health/functioning reason only'
    2= '2 Other reason only'
    3= '3 Both health/functioning and other'
    4= '4 Service/someone from the place SP lives'
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

  VALUE dmealsfd
    1 = '1 Did not do by self in last month'
    2 = '2 Did by self in last month/No Difficulty'
    3 = '3 Did by self in last month/Difficulty'
    4 = '4 DKRF Did by self in last month/No Difficulty'
    5 = '5 DKRF Did by self in last month/Difficulty'
    6 = '6 Did by self in last month/DKRF Difficulty'
    7 = '7 DKRF Did by self in last month/DKRF Difficulty'
    8 = '8 Not done in last month'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

    VALUE dmealrea
    1= '1 Health/functioning reason only'
    2= '2 Other reason only'
    3= '3 Both health/functioning and other'
    4= '4 Service/someone from the place SP lives'
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

  VALUE dbanksfd
    1 = '1 Did not do by self in last month'
    2 = '2 Did by self in last month/No Difficulty'
    3 = '3 Did by self in last month/Difficulty'
    4 = '4 DKRF Did by self in last month/No Difficulty'
    5 = '5 DKRF Did by self in last month/Difficulty'
    6 = '6 Did by self in last month/DKRF Difficulty'
    7 = '7 DKRF Did by self in last month/DKRF Difficulty'
    8 = '8 Not done in last month'
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

  VALUE dbankrea
    1= '1 Health/functioning reason only'
    2= '2 Other reason only'
    3= '3 Both health/functioning and other'
    4= '4 Service/someone from the place SP lives'
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

  VALUE deatdevi
    1 = '1 No use of adapted utensils in last month'
    2 = '2 Use of adapted utensils in last month'
    8 = '8 Not done in last month'
    3 = '3 DKRF If used adapted utensils in last month'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

  VALUE deathelp
    1 = '1 No help eating in last month'
    2 = '2 Had help eating in last month'
    3 = '3 DKRF If had help eating in last month'
    8 = '8 Not done in last month'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

  VALUE deatsfdf
    1 = '1 Did not do by self in last month'
    2 = '2 No Difficulty by self (and when using utensils)'
    3 = '3 Difficulty by self (and when using utensils)'
    6 = '6 Did by self in last month/DKRF Difficulty'
    7 = '7 DKRF Did by self in last month/DKRF Difficulty'
    8 = '8 Not done in last month'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

  VALUE dbathdev
    1 = '1 No use of grab bars or bath seats in last month'
    2 = '2 Use of grab bars or bath seats in last month'
    3 = '3 DKRF If use of grab bars or bath seats in last month'
    4 = '4 DKRF If had grab bars or bath seats in last month'
    9 = '9 No bars/seats/shower/tub or washes up other way'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

  VALUE dbathhel
    1 = '1 No help bathing in last month'
    2 = '2 Had help bathing in last month'
    3 = '3 DKRF If had help bathing in last month'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

  VALUE dbathsfd
    1 = '1 Did not do by self in last month'
    2 = '2 No Difficulty by self (and when using grab bars or tub seat)'
    3 = '3 Difficulty by self (and when using grab bars or tub seat)'
    6 = '6 Did by self in last month/DKRF Difficulty'
    7 = '7 DKRF Did by self in last month/DKRF Difficulty'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

  VALUE dtoildev
    1 = '1 No use of toileting devices in last month'
    2 = '2 Use of toileting devices in last month'
    3 = '3 DKRF of some and no use of other toileting devices in last month'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

  VALUE dtoilhel
    1 = '1 No help toileting in last month'
    2 = '2 Had help toileting in last month'
    3 = '3 DKRF If had help toileting in last month'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

  VALUE dtoilsfd
    1 = '1 Did not do by self in last month'
    2 = '2 No Difficulty by self (and when using toileting devices)'
    3 = '3 Difficulty by self (and when using toileting devices)'
    6 = '6 Did by self in last month/DKRF Difficulty'
    7 = '7 DKRF Did by self in last month/DKRF Difficulty'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

  VALUE ddresdev
    8 = '8 Not done in last month'
    9 = '9 DKRF If dressed in last month'
    2 = '2 Use of dressing devices in last month'
    1 = '1 No Use of dressing devices in last month'
    3 = '3 DKRF If use of dressing devices in last month'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

  VALUE ddreshel
    8 = '8 Not done in last month'
    9 = '9 DKRF If dressed in last month'
    1 = '1 No help dressing in last month'
    2 = '2 Had help dressing in last month'
    3 = '3 DKRF if had help dressing in last month'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

  VALUE ddressfd
    1 = '1 Did not do by self in last month'
    2 = '2 No Difficulty by self (and when using dressing devices)'
    3 = '3 Difficulty by self (and when using dressing devices)'
    6 = '6 Did by self in last month/DKRF Difficulty'
    7 = '7 DKRF Did by self in last month/DKRF Difficulty'
    8 = '8 Not done in last month'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';
  VALUE dmedssfd
    1 = '1 Did not do by self in last month'
    2 = '2 Did by self in last month/No Difficulty'
    3 = '3 Did by self in last month/Difficulty'
    4 = '4 DKRF Did by self in last month/No Difficulty'
    5 = '5 DKRF Did by self in last month/Difficulty'
    6 = '6 Did by self in last month/DKRF Difficulty'
    7 = '7 DKRF Did by self in last month/DKRF Difficulty'
    8 = '8 Not done in last month'
    9 = '9 No or DKRF if medications taken in last month'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

  VALUE dmedsrea
    1 = '1 HEALTH/FUNCTIONING REASON ONLY'
    2 = '2 OTHER REASON ONLY'
    3 = '3 BOTH HEALTH/FUNCTIONING AND OTHER'
    4 = '4 SERVICE/SOMEONE FROM THE PLACE SP LIVES'
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

  VALUE dmarstat
    1 = '1 Married'
    2 = '2 Living with a partner'
    3 = '3 Separated'
    4 = '4 Divorced'
    5 = '5 Widowed'
    6 = '6 Never married'
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';
  VALUE DSPSAGEC
     -7 = '-7 - RF'
     -8 = '-8 - DK'
     -1 = '-1 - Inapplicable'
     -9 = '-9 - Missing'
      1 = " 1 - UNDER 50"
      2 = " 2 - 50-54"
      3 = " 3 - 55-59"
      4 = " 4 - 60-64"
      5 = " 5 - 65-69"
      6 = " 6 - 70-74"
      7 = " 7 - 75-79"
      8 = " 8 - 80-84"
      9 = " 9 - 85-89"
     10 = "10 - 90 +"    ;

    VALUE f_dresid
        1 = '1 Community '
        2 = '2 Residential care not nursing home (SP interview)'
        3 = '3 Residential care not nursing home (FQ only)'
        4 = '4 Nursing home (SP interview)'
        5 = '5 Nursing home (FQ only)'
        6 = '6 Deceased'
        7 = '7 Residential care not nursing home in R1 and R2 (FQ only)'
        8 = '8 Nursing home in R1 and R2 (FQ only)' ;

VALUE QUARTILE
-9="-9 Missing"
-1="-1 Inapplicable";

VALUE SPPB
-9="-9 Missing"
-1="-1 Inapplicable";
VALUE SPPB_MIS
    -9="-9 Missing"
    -1="-1 Inapplicable"
    1="1 PROXY INTERVIEW"
    2="2 MISSING WALK AND REPEAT CHAIR AND BALANCE"
    3="3 MISSING WALK AND REPEAT CHAIR"
    4="4 MISSING WALK AND BALANCE"
    5="5 MISSING REPEAT CHAIR AND BALANCE"
    6="6 MISSING WALK"
    7="7 MISSING REPEAT CHAIR"
    8="8 MISSING BALANCE"
    9="9 NO SPACE"
    10="10 NO CHAIR"
    11="11 NO SPACE WALK AND NO CHAIR"
    12="12 NO SPACE WALK AND NON-SAFETY MISSING"
    13="13 NO CHAIR AND NON-SAFETY MISSING"
    14="14 NON-SAFETY WALK"
    15="15 NON-SAFETY CHAIR"
    16="16 NON-SAFETY BALANCE"
    17="17 NON-SAFETY WALK AND CHAIR"
    18="18 NON-SAFETY WALK AND BALANCE"
    19="19 NON-SAFETY CHAIR AND BALANCE"
    20="20 NON SAFETY WALK AND CHAIR AND BALANCE";

    VALUE DCLCKSC
      0 = '0 Not recognizable as a clock'
      1 = '1 Severely distorted depiction of a clock'
      2 = '2 Moderately distorted depection of a clock'
      3 = '3 Mildly distorted depiction of a clock'
      4 = '4 Reasonably accurate depiction of a clock'
      5 = '5 Accurate depiction of a clock (circular or square)'
    -7 = '-7 SP refused to draw clock'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -2 = '-2 Proxy says cannot ask SP'
    -3 = '-3 Proxy says can ask SP but SP unable to answer'
    -4 = '-4 SP did not attempt to draw clock'
    -9 = '-9 Missing';

    VALUE DCLCKCL
      1 = '1 Very clear'
      2 = '2 Somewhat clear'
      3 = '3 Somewhat unclear'
      4 = '4 Very unclear'
      5 = '5 Blank'
    -7 = '-7 SP refused to draw clock'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -2 = '-2 Proxy says cannot ask SP'
    -3 = '-3 Proxy says can ask SP but SP unable to answer'
    -4 = '-4 SP did not attempt to draw clock'
    -9 = '-9 Missing';

VALUE RESULT
    -9='-9: MISSING'
    1='1: COMPLETED W RESULTS'
    2='2: COMPLETED MISSING RESULTS'
    3='3: ATTEMPTED W RESULTS'
    4='4: ATTEMPTED MISSING RESULTS'
    5='5: NOT ATTEMPTED SAFETY'
    6='6: NOT ATTEMPTED NOT SAFETY REASON'
    7='7: NO CHAIR/NO SPACE'
    9='9: NOT ATTEMPTED/MISSING';

    VALUE RESULT_SCH
    -9='-9: MISSING'
    1='1: COMPLETED W/OUT ARMS'
    2='2: COMPLETED W ARMS'
    3='3: ATTEMPTED W RESULTS'
    4='4: ATTEMPTED MISSING RESULTS'
    5='5: NOT ATTEMPTED SAFETY'
    6='6: NOT ATTEMPTED NOT SAFETY REASON'
    7='7: NO CHAIR/SAFETY REASON'
    8='8: NO CHAIR/NOT SAFETY REAS'
    9='9: NOT ATTEMPTED/MISSING'
    10='10: CH4=1 SINGLE CHAIR NOT COMPL';

    VALUE RESULT_RCH
    -9='-9: MISSING'
    1='1: COMPLETED W/OUT ARMS'
    2='2: COMPLETED MISSING RESULTS'
    3='3: ATTEMPTED W RESULTS'
    4='4: ATTEMPTED MISSING RESULTS'
    5='5: NOT ATTEMPTED SAFETY'
    6='6: NOT ATTEMPTED NOT SAFETY REASON'
    9='9: NO CHAIR OR NOT ATTEMPTED/MISSING';

    VALUE ZEROSCORE
    1="1: NOT ELIGIBLE DUE TO EXCLUSION CRITERIA"
    2="2: NOT ATTEMPTED FOR SAFETY REASON"
    3="3: ATTEMPTED CHAIR STANDS/NOT ATTEMPTED FOR SAFETY"
    4="4: ATTEMPTED"
    5="5: NEW WALKING EXCLUSION"
    9="9: NOT ASSIGNED A ZERO SCORE";

   VALUE D_LMLLOC
    1 = '1 Community'
    2 = '2 Residential Care'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

      VALUE D_LOCSP
       -7 = '-7 RF'
       -8 = '-8 DK'
       -1 = '-1 Inapplicable'
       -9 = '-9 Missing'
        1 = "1 Independent Living/Housing/Retirement"
        2 = "2 Assisted Living/Personal Care"
        3 = "3 Special Care, Memory or Alzheimer's Unit"
        4 = "4 Nursing Home"
        8 = "8 Not Reported" ;

        VALUE PA25FMT
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing'
    111= '111 Sleeping Napping'
    131= '131 Eating'
    132= '132 Going out to eat'
    199= '199 Other self care activities'
    211= '211 Work and work-related activities'
    221= '221 Other income generating activities'
    241= '241 Volunteering'
    299= '299 Other productive activities'
    321= '321 Shopping for non-durable goods'
    399= '399 Other shopping'
    411= '411 Food and drink preparation'
    434= '434 Outdoor Maintenance'
    439= '439 Household chores (cannot tell if indoor/outdoor)'
    441= '441 Animal and pet care'
    442= '442 Walking and exercising pets'
    449= '449 Other animal and pet care'
    451= '451 Vehicle maintenance and repair'
    471= '471 Financial management'
    499= '499 Other household activities'
    511= '511 Physical care and assistance to others'
    599= '599 Other physical care'
    611= '611 Socializing with others in person'
    612= '612 Socializing with others on the phone'
    616= '616 Socializing and communicating on the computer'
    621= '621 Watching TV and movies'
    631= '631 Doing puzzles or games not on computer or online'
    632= '632 Gambling not online or at a casino'
    636= '636 Doing puzzles or games on a computer or online'
    641= '641 Arts and crafts or hobbies'
    642= '642 Reading'
    643= '643 Writing'
    644= '644 Listening to music'
    646= '646 Computer or online leisure activities'
    651= '651 Smoking or other tobacco use'
    652= '652 Drinking alcohol'
    661= '661 Doing nothing/relaxing'
    669= '669 No activity'
    699= '699 Other non active leisure'
    711= '711 Playing sports'
    712= '712 Walking or jogging'
    713= '713 Other outdoor recreating activities'
    714= '714 Attending sporting events'
    715= '715 Other physical activity, exercise, yoga, swimming, working out, dancing'
    718= '718 Watching sporting events'
    721= '721 Attending arts  including plays and concerts'
    723= '723 Attending movies'
    724= '724 Attending casinos'
    737= '737 Travel for leisure'
    799= '799 Other active leisure'
    811= '811 Attending religious activities'
    812= '812 Other religious and spirtual activities'
    821= '821 Attending meetings or events'
    899= '899 Other organizational activity'
    991= '991 Other miscellaneous'
    992= '992 No favorite activity'
    997= '997 Refused'
    998= '998 Dont Know'
    999= '999 Not Codeable';

          VALUE OCC_CODE
1   ='1 Management Occupations: 0010-0430'
2   ='2 Business and Financial Operations Occupations:  0500-0950'
3   ='3 Computer and mathematical occupations:  1000-1240'
4   ='4 Architecture and Engineering Occupations:   1300-1560'
5   ='5 Life, Physical, and Social Science Occupations: 1600-1965'
6   ='6 Community and Social Service Occupations:   2000-2060'
7   ='7 Legal Occupations:  2100-2160'
8   ='8 Education, Training, and Library Occupations:   2200-2550'
9   ='9 Arts, Design, Entertainment, Sports, and Media Occupations: 2600-2960'
10  ='10 Healthcare Practitioners and Technical Occupations:    3000-3540'
11  ='11 Healthcare Support Occupations:    3600-3655'
12  ='12 Protective Service Occupations:    3700-3955'
13  ='13 Food Preparation and Serving Related Occupations:  4000-4160'
14  ='14 Building and Grounds Cleaning and Maintenance Occupations: 4200-4250'
15  ='15 Personal Care and Service Occupations: 4300-4650'
16  ='16 Sales and Related Occupations: 4700-4965'
17  ='17 Office and Administrative Support Occupations: 5000-5940'
18  ='18 Farming, Fishing, and Forestry Occupations:    6000-6130'
19  ='19 Construction and Extraction Occupations:   6200-6940'
20  ='20 Installation, Maintenance, and Repair Occupations: 7000-7630'
21  ='21 Production Occupations:    7700-8965'
22  ='22 Transportation and Material Moving Occupations:    9000-9750'
23  ='23 Military Specific Occupations: 9800-9830'
24  ='24 No current occ (Unemployed, no work in the last 5 years, never worked):  9920'
25 = '25 Blank field'
26 = '26 Code did not match'
94 = '94 Uncodable'
95 = '95 Never Worked Entire Life'
96 = '96 Homemaker/Raised Children'
-7 = '-7 RF'
-8 = '-8 DK'
-1 = '-1 Inapplicable'
-9 = '-9 Missing';

    Value fl_Dfac
1 = '1 Should have routed as facility but did not'
2 = '2 Routed as facility but determined not facility resident'
-1 = '-1 Inapplicable';
VALUE PE_RSLT
    -9='-9 Missing'
    -1 = '-1 Inapplicable'
    1='1 Completed'
    2='2 Attempted'
    3='3 Not attempted' ;
VALUE dosfacd /* FOR FQ2dosfacd  */
        -9= "-9 Missing"
       -8 = "-8 DK"
       -1 = "-1 INAPPLICABLE"
        1 = " 1 FREE STANDING NURSING HOME"
        2 = " 2 FREE STANDING ASSISTED LIVING FACILITY / RESIDENTIAL CARE FACILITY"
        3 = " 3 NURSING HOME AND ASSISTED LIVING FACILITY"
        4 = " 4 CONTINUING CARE RETIREMENT COMMUNITY (CCRC)"
        5 = " 5 ADULT FAMILY CARE HOME"
        6 = " 6 GROUP HOME"
        7 = " 7 BOARD AND CARE HOME / PERSONAL CARE HOME"
        8 = " 8 RETIREMENT COMMUNITY OR SENIOR HOUSING (NOT CCRC)"
        9 = " 9 INDEPENDENT LIVING"
       10 = " 10 ASSISTED AND INDEPENDENT/RETIREMENT (NO NURSING HOME)"
       11 = " 11 HOUSING (APT, CONDO, ETC.)";
        ;
    VALUE dosfaca /* FOR FQ2dosfaca */
        -9= "-9 Missing"
       -8 = "-8 DK"
       -1 = "-1 INAPPLICABLE"
        1 = " 1 INDEPENDENT LIVING / HOUSING / RETIREMENT "
        2 = " 2 ASSISTED LIVING / PERSONAL CARE"
        3 = " 3 SPECIAL CARE, MEMORY CARE, OR ALZHEIMER'S UNIT"
        4 = " 4 NURSING HOME"   ;

VALUE INAP_YN
     1 = ' 1 Yes'
     2 = ' 2 No'
    -1 = '-1 Inapplicable' ;
VALUE CENDIV /* RE1DCENSDIV - Updated for R2 - Re-Release */
    1 =  '1 Northeast Region: New England Division (ME, NH, VT, MA, RI, CT)'
    2 =  '2 Northeast Region: Middle Atlantic Division (NY, NJ, PA)'
    3 =  '3 Midwest Region: East North Central Division (OH, IN, IL, MI, WI)'
    4 =  '4 Midwest Region: West North Central Division (MN, IA, MO, ND, SD, NE, KS)'
    5 =  '5 South Region: South Atlantic Division (DE, MD, DC, VA, WV, NC, SC, GA, FL)'
    6 =  '6 South Region: East South Central Division (KY, TN, AL, MS)'
    7 =  '7 South Region: West South Central Division (AR, LA, OK, TX)'
    8 =  '8 West Region: Mountain Division (MT, ID, WY, CO, NM, AZ, UT, NV)'
    9 =  '9 West Region: Pacific Division (WA, OR, CA, AK, HI)'
    -9 = '-9 Missing';

	VALUE W000002W
      -7 = '-7 RF'
      -8 = '-8 DK'
      -1 = '-1 Inapplicable'
      -9 = '-9 Missing'
       1 = "1 MALE"
       2 = "2 FEMALE"  ;

    VALUE W000005W
     1 = ' 1 Yes'
     2 = ' 2 No'
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

	VALUE R1DRESID
     1 = '1 Community '
     2 = '2 Residential Care Resident not nursing home (SP interview complete)'
     3 = '3 Residential Care Resident not nursing home (FQ only)'
     4 = '4 Nursing Home Resident';

  VALUE W200016W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 MEDICAID"
    2 = "2 MEDICARE"
    3 = "3 STATE PROGRAM"
    91 = "91 OTHER (SPECIFY)"   ;

	VALUE W200012W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 REGULAR"
    2 = "2 VARIED"  ;

  VALUE W200061W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 SEPARATION OR DIVORCE"
    2 = "2 DECEASED"
    3 = "3 MOVED ELSEWHERE"
    5 = "5 LAST INTERVIEW INFORMATION INCORRECT"
    8 = "8 OTHER REASON"   ;

  VALUE d2hrsmth
    -13= '-13 Deceased '
    -12= '-12 Zero days/wk'
    -11= '-11 Hours missing'
    -10= '-10 Days missing'
    -9 = ' -9 Days and hrs missing'
    -1 = ' -1 - Inapplicable'
    -7 = ' -7 - RF'
    -8 = ' -8 - DK'
     0-<1  ='<1'
     1-<10 =' 1-<10'
    10-<20 ='10-<20'
    20-<30 ='20-<30'
    30-<40 ='30-<40'
    40-<60 ='40-<60'
    60-<120 ='60-<120'
    120-<180='120-<180'
    180-744='180-744(24/7)'
     9999='9999 Not codeable, <1 hour/day' ;

  VALUE dhrsmth
    -11= '-11:hours missing'
    -10= '-10:days missing'
    -9 = '-9:days and hrs missing'
    -1 = '-1 - Inapplicable'
    -7 = '-7 - RF'
    -8 = '-8 - DK'
     0-<1  ='<1'
     1-<10 =' 1-<10'
    10-<20 ='10-<20'
    20-<30 ='20-<30'
    30-<40 ='30-<40'
    40-<60 ='40-<60'
    60-<120 ='60-<120'
    120-<180='120-<180'
    180-744='180-744(24/7)'
     9999='9999 Not codeable, <1 hour/day' ;

 Value dmissadd
-1='-1 not applicable'
 1='1 no flags and added at CL section'
 2='2 no flags and added at DT section'
 3='3 no flags and added at EW section'
 4='4 no flags and added at HA section'
 5='5 no flags and added at HO section'
 6='6 no flags and added at MC section'
 7='7 no flags and added at MO section'
 8='8 no flags and added at PA section'
 9='9 no flags and added at PE section'
10='10 no flags and added at SC section'
11='11 no flags and added at SN section';

Value d2mssadd
-1='-1 not applicable'
 0='0 no flags and added at undertermined section'
 1='1 no flags and added at CL section'
 2='2 no flags and added at DT section'
 3='3 no flags and added at EW section'
 4='4 no flags and added at HA section'
 5='5 no flags and added at HO section'
 6='6 no flags and added at MC section'
 7='7 no flags and added at MO section'
 8='8 no flags and added at PA section'
 9='9 no flags and added at PE section'
10='10 no flags and added at SC section'
11='11 no flags and added at SN section'
12='12 no flags and added at CS section'
13='13 no flags and added at HH section'
14='14 no flags and added at IS section';

Value dopage3c
 -9='-9 - Missing'
 -8='-8 - RF'
 -7='-7 - DK'
 -1='-1 - Inapplicable'
  1='1 UNDER 30'
  2='2 30-39'
  3='3 40-49'
  4='4 50-59'
  5='5 60-69'
  6='6 70-79'
  7='7 80-89'
  8='8 90 +';

 Value dopagect
-9='-9 Missing'
-8='-8 DK'
-7='-7 RF'
-1='-1 Inapplicable'
 1='1 UNDER 20'
 2='2 20-24'
 3='3 25-29'
 4='4 30-34'
 5='5 35-39'
 6='6 40-44'
 7='7 45-49'
 8='8 50-54'
 9='9 55-59'
10='10 60-64'
11='11 65-69'
12='12 70-74'
13='13 75-79'
14='14 80-84'
15='15 85-89'
16='16 90 +';


  VALUE W200008W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "UNDER 20"
    2 = "20-24"
    3 = "25-29"
    4 = "30-34"
    5 = "35-39"
    6 = "40-44"
    7 = "45-49"
    8 = "50-54"
    9 = "55-59"
    10 = "60-65"
    11 = "66-69"
    12 = "70-74"
    13 = "75-79"
    14 = "80-85"
    15 = "86-89"
    16 = "90-94"
    17 = "95-99"
    18 = "100 +"
  ;
    VALUE NumCigs
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing'
	999 = '999 SP smokes less than 1 cigarette / day';

	
  VALUE dlmlint
    1 = '1 Last month of life interview'
   -1 = '-1 Inapplicable'     ;

  VALUE d2intvra
     1 = '65 to 69'
     2 = '70 to 74'
     3 = '75 to 79'
     4 = '80 to 84'
     5 = '85 to 89'
     6 = '90+'
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'     ;

  VALUE dad8dem
    1 = '1 DEMENTIA RESPONSE TO ANY AD8 ITEMS IN PRIOR ROUND'
   -1 = '-1 Inapplicable'    ;

  VALUE dwrdinon
  1 = '1 NO WORDS REMEMBERED'
   -1 = '-1 Inapplicable'
     -9 = '-9 Missing'     ;

  VALUE dwrdirre
    1 = '1 REFUSED WORD RECALL TASK'
   -1 = '-1 Inapplicable'
      -9 = '-9 Missing'     ;

 VALUE A0001AB
      1 = "1 AM"
      2 = "2 PM"
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing';

 VALUE A0002WA
      1 = "1 Yes, there is space to set up the walking course"
      2 = "2 No, there is not space to set up the walking course"
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing';

 VALUE A0004WA
      1 = "1 None"
      2 = "2 Cane"
      3 = "3 Walker or rollator"
      9 = "9 Other, specify"
     -1 = '-1 Inapplicable'
     -7 = '-7 RF'
     -8 = '-8 DK'
     -9 = '-9 Missing';

 VALUE A0004CH
      1 = "1 No, chair stand not completed"
      2 = "2 Yes, chair stand completed"
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing';

 VALUE A0008CH
      1 = "1 With arms"
      2 = "2 Without arms"
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing';

 VALUE A0014CH
      1 = "1 1 Chair stand completed"
      2 = "2 2 Chair stands completed"
      3 = "3 3 Chair stands completed"
      4 = "4 4 Chair stands completed"
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing';

VALUE BA1SS
    1 = '1 Eligible and recorded result for SxS Balance'
    2 = '2 Eligible and no recorded result for SxS Balance'
    4 = '4 Not Eligible due to exclusion criteria'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

VALUE BA1STAN
    1 = '1 Eligible and recorded result for Semi Tandem Balance'
    2 = '2 Eligible and no recorded result for Semi Tandem Balance'
    3 = '3 Not administered because did not complete prior balance test'
    4 = '4 Not Eligible due to exclusion criteria'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

VALUE BA1TAN
    1 = '1 Eligible and recorded result for full tandem balance'
    2 = '2 Eligible and no recorded result for full tandem balance'
    3 = '3 Not administered because did not complete prior balance tests'
    4 = '4 Not Eligible due to exclusion criteria'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

VALUE BA1OP
    1 = '1 Eligible and recorded result for one leg eyes open balance'
    2 = '2 Eligible and no recorded result for one leg eyes open balance'
    3 = '3 Not administered because did not complete prior balance tests'
    4 = '4 Not Eligible due to exclusion criteria'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

VALUE BA1CL
    1 = '1 Eligible and recorded result for one leg eyes closed balance'
    2 = '2 Eligible and no recorded result for one leg eyes closed balance'
    3 = '3 Not administered because did not complete prior balance tests'
    4 = '4 Not Eligible due to exclusion criteria'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

VALUE WA1WLK
    1 = '1 Eligible and recorded result for walking course'
    2 = '2 Eligible and no recorded result for walking course'
    4 = '4 Not Eligible due to exclusion criteria'
    5 = '5 Not Eligible on exclusion criteria but recorded result (SP changed mind)'
    -1 = '-1 Inapplicable '
    -9 = '-9 Missing';

VALUE CH1SCH
    1 = '1 Eligible and recorded result for single chair stand'
    2 = '2 Eligible and no recorded result for single chair stand'
    4 = '4 Not Eligible due to exclusion criteria'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

VALUE CH1RSH
    1 = '1 Eligible and recorded result for repeated chair stand'
    2 = '2 Eligible and no recorded result for repeated chair stand'
    3 = '3 Not administered because did not complete single chair stand w/o arms'
    4 = '4 Not Eligible due to exclusion criteria'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

VALUE GR1GRIP
    1 = '1 Eligible and recorded result for grip strength'
    2 = '2 Eligible and no recorded result for grip strength'
    4 = '4 Not Eligible due to exclusion criteria'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

VALUE WC1WAIST
    1 = '1 Eligible and recorded result for waist circumference'
    2 = '2 Eligible and no recorded result for waist circumference'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

VALUE PK1PEAK
    1 = '1 Eligible and recorded result for peak air flow'
    2 = '2 Eligible and no recorded result for peak air flow'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

 VALUE RGT_LFT
   1 = '1 Right'
   2 = '2 Left'
  -1 = '-1 Inapplicable'
  -9 = '-9 Missing';

 VALUE PERSON
    1 = '1 Interviewer'
    2 = '2 Sample person'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing';

 VALUE STAND
     1 = '1 Standing'
     2 = '2 Sitting'
     3 = '3 Lying down'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

 VALUE EFFORT
      1 = '1 Full effort'
      2 = '2 Less effort for health reason'
      3 = '3 Less effort for other reason'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing';
    VALUE WORDREC
        1 = ' 1 LIST 1'
        2 = ' 2 LIST 2'
        3 = ' 3 LIST 3'
       -1 = '-1 Inapplicable '
       -9 = '-9 Missing';
    VALUE WORDRE_N
        -1 = '-1 Inapplicable'
        -2 = '-2 Proxy says cannot ask SP'
        -3 = '-3 Proxy says can ask SP but SP unable to answer'
        -7 = '-7 SP refused activity'
        -9 = '-9 Missing';

        VALUE  DMH_GRP
            1 = "1 Help started"
            2 = "2 Help ended"
            3 = "3 Help both interviews with gap"
            4 = "4 Help both interviews with no gap"
            5 = "5 Help between interviews only (month ended missing)"
            6 = "6 No help either interview or between"
           11 = "11 Help started (month started missing)"
           21 = "21 Help ended (month ended missing)"
           41 = "41 Help both interviews (DK whether gap)"
           61 = "61 No help either interview (DK whether help between)"
           -9 = "-9 Missing"
           -1 = "-1 Inapplicable"
         -999 = "-999 Not determined" ;

        VALUE  DMU_GRP
            1 = "1 Use started"
            2 = "2 Use ended"
            3 = "3 Use both interviews with gap"
            4 = "4 Use both interviews with no gap"
            5 = "5 Use between interviews only (month ended missing)"
            6 = "6 No use either interview or between"
           11 = "11 Use started (month started missing)"
           21 = "21 Use ended (month ended missing)"
           41 = "41 Use both interviews (DK whether gap)"
           61 = "61 No use either interview (DK whether use between)"
           -9 = "-9 Missing"
           -1 = "-1 Inapplicable"
         -999 = "-999 Not determined" ;

       VALUE  DS_GRP
            1 = "1 Help started"
            2 = "2 Help ended"
            3 = "3 Help both interviews with gap"
            4 = "4 Help both interviews with no gap"
            5 = "5 Help between interviews only"
            6 = "6 No help either interview or between"
           11 = "11 Help started (month started missing)"
           21 = "21 Help ended (month ended missing)"
           41 = "41 Help both interviews (DK whether gap)"
           61 = "61 No help either interview (DK whether help between)"
           -9 = "-9 Missing"
           -1 = "-1 Inapplicable"
         -999 = "-999 Not determined" ;

		VALUE  DMDSINTV
            0 = "0 Less than 1 month"
            1 = "1 Month"
            2 = "2 Months"
            3 = "3 Months"
            4 = "4 Months"
            5 = "5 Months"
            6 = "6 Months"
            7 = "7 Months"
            8 = "8 Months"
            9 = "9 Months"
           10 = "10 Months"
           11 = "11 Months"
           12 = "12 Months"
           13 = "13 Months"
           14 = "14 Months"
           15 = "15 Months"
           16 = "16 Months"
           17 = "17 Months"
           18 = "18 Months"
           19 = "19 Months"
           20 = "20 Months"
           90 = "90 Last round disputed"
           -1 = "-1 Inapplicable"
           -7 = "-7 Refused"
           -8 = "-8 Dont know"
           -9 = "-9 Missing" ;

        VALUE  DMDS_DUR
            0 = "0 Less than 1 month"
            1 = "1 Month"
            2 = "2 Months"
            3 = "3 Months"
            4 = "4 Months"
            5 = "5 Months"
            6 = "6 Months"
            7 = "7 Months"
            8 = "8 Months"
            9 = "9 Months"
           10 = "10 Months"
           11 = "11 Months"
           12 = "12 Months"
           13 = "13 Months"
           14 = "14 Months"
           15 = "15 Months"
           16 = "16 Months"
           17 = "17 Months"
           90 = "90 Last round disputed"
           -1 = "-1 Inapplicable"
           -7 = "-7 Refused"
           -8 = "-8 Dont know"
           -9 = "-9 Missing"
          -10 = "-10 Not ascertained"
          -12 = "-12 Outside of range"
          -13 = "-13 None" ;

        VALUE  DMDSFLG
            -1 = "-1 Inapplicable"
             1 = "1 No SP interview last round"
             2 = "2 Died and month death missing"
             3 = "3 Died <=1 month after last interview"
             4 = "4 Died 12-13 months after last interview"
             5 = "5 Died and not mobile (fl2notmobile=1)"
             6 = "6 Died and not alert (fl2notalert =1)"
             7 = "7 Skipped 1 or more help questions" ;

run;
/* Section #2 - Input statement with variable name and location on the .txt file  
		Reminder - change [PATH] to reflect your file locations       */
Data spfile;
INFILE  "[PATH]\NHATS_Round_2_SP_File_v2.txt"

LRECL=3495 ;
INPUT  @1 spid 8.
@9 r2dlmlint 2.
@11 r2dresid 2.
@13 r1dresid 2.
@15 r2dresidlml 2.
@17 r2breakoffst 2.
@19 r2breakoffqt $8.
@27 is2resptype 2.
@29 is2reasnprx1 2.
@31 is2reasnprx2 2.
@33 is2reasnprx3 2.
@35 is2reasnprx4 2.
@37 is2reasnprx5 2.
@39 is2reasnprx6 2.
@41 is2reasnprx7 2.
@43 is2reasnprx9 2.
@45 is2tempres 2.
@47 is2prxyrelat 2.
@49 is2prxygendr 2.
@51 is2famrrutin 2.
@53 is2proxlivsp 2.
@55 r2d2intvrage 2.
@57 is2dproxyid $3.
@60 re2spadrsnew 2.
@62 re2intplace 2.
@64 re2newstrct 2.
@66 re2newblgfl 2.
@68 re2mthmove 2.
@70 re2yearmove 4.
@74 re2placedec 2.
@76 re2alonedec 2.
@78 re2dadrscorr 2.
@80 re2dresistrct 2.
@82 re2dbldg 2.
@84 re2dcensdiv 2.
@86 fl2structure 2.
@88 fl2bldgfl 2.
@90 fl2resnew 2.
@92 fl2facility 2.
@94 fl2hotype 2.
@96 fl2retirecom 2.
@98 pd2placedied 2.
@100 pd2homedied 2.
@102 pd2hospdied 2.
@104 pd2hospice1 2.
@106 pd2hospice2 2.
@108 pd2stayunit 2.
@110 pd2staydays 3.
@113 pd2staywks 2.
@115 pd2staymths 2.
@117 pd2stayyrs 2.
@119 pd2staymthpl 2.
@121 pd2placepre 2.
@123 pd2alert 2.
@125 pd2outbed 2.
@127 r2d2deathage 2.
@129 fl2spdied 2.
@131 fl2notalert 2.
@133 fl2notmobile 2.
@135 lm2pain 2.
@137 lm2painhlp 2.
@139 lm2painhlpam 2.
@141 lm2bre 2.
@143 lm2brehlp 2.
@145 lm2brehlpam 2.
@147 lm2sad 2.
@149 lm2sadhlp 2.
@151 lm2sadhlpam 2.
@153 lm2caredecis 2.
@155 lm2carenowan 2.
@157 lm2perscare 2.
@159 lm2respect 2.
@161 lm2informed 2.
@163 lm2doctor 2.
@165 lm2docclear 2.
@167 lm2relg 2.
@169 lm2relgamt 2.
@171 lm2ratecare 2.
@173 hc2health 2.
@175 hc2disescn1 2.
@177 hc2disescn2 2.
@179 hc2disescn3 2.
@181 hc2disescn4 2.
@183 hc2disescn5 2.
@185 hc2disescn6 2.
@187 hc2disescn7 2.
@189 hc2disescn8 2.
@191 hc2disescn9 2.
@193 hc2disescn10 2.
@195 hc2brokebon1 2.
@197 hc2brokebon2 2.
@199 hc2hosptstay 2.
@201 hc2hosovrnht 2.
@203 hc2knesrgyr 2.
@205 hc2hipsrgyr 2.
@207 hc2catrsrgyr 2.
@209 hc2backsrgyr 2.
@211 hc2hartsrgyr 2.
@213 hc2fllsinmth 2.
@215 hc2worryfall 2.
@217 hc2worrylimt 2.
@219 hc2faleninyr 2.
@221 hc2multifall 2.
@223 hc2depresan1 2.
@225 hc2depresan2 2.
@227 hc2depresan3 2.
@229 hc2depresan4 2.
@231 hc2aslep30mn 2.
@233 hc2trbfalbck 2.
@235 hc2sleepmed 2.
@237 ht2placedesc 2.
@239 ht2retiresen 2.
@241 ht2diffareun 2.
@243 ht2helpmedbd 2.
@245 ht2meals 2.
@247 ht2spacename 2.
@249 se2servcoff1 2.
@251 se2servcoff2 2.
@253 se2servcoff3 2.
@255 se2servcoff4 2.
@257 se2servcoff5 2.
@259 se2servcoff6 2.
@261 se2servcoff7 2.
@263 se2servcoff8 2.
@265 se2servcoff9 2.
@267 se2servused1 2.
@269 se2servused2 2.
@271 se2servused3 2.
@273 se2servused4 2.
@275 se2servused5 2.
@277 se2servused6 2.
@279 se2servused7 2.
@281 se2servused8 2.
@283 se2servused9 2.
@285 se2payservi1 2.
@287 se2payservi2 2.
@289 se2payservi3 2.
@291 se2payservi4 2.
@293 se2payservi5 2.
@295 se2payservi6 2.
@297 se2payservi7 2.
@299 se2payservi8 2.
@301 se2payservi9 2.
@303 hh2marchange 2.
@305 hh2martlstat 2.
@307 hh2yrendmarr 2.
@309 hh2newspoprt 2.
@311 hh2spgender 2.
@313 hh2dspouage 2.
@315 hh2dspageall 2.
@317 hh2spouseduc 2.
@319 hh2spoupchlp 2.
@321 hh2livwthspo 2.
@323 hh2placekind 2.
@325 hh2dmarstat 2.
@327 hh2dlvngarrg 2.
@329 hh2dhshldnum 2.
@331 hh2dhshldchd 2.
@333 hh2dspouseid $3.
@336 cs2sistrsnum 2.
@338 cs2brthrsnum 2.
@340 cs2dnumchild 2.
@342 cs2dnmstpchd 2.
@344 cs2dnumdaugh 2.
@346 cs2dnumson 2.
@348 sn2dnumsn 2.
@350 fl2noonetalk 2.
@352 ho2entrstair 2.
@354 ho2entrccomn 2.
@356 ho2entrnramp 2.
@358 ho2bldgamen1 2.
@360 ho2bldgamen2 2.
@362 ho2bldgamen3 2.
@364 ho2bldgamen4 2.
@366 ho2levelsflr 2.
@368 ho2homeamen1 2.
@370 ho2homeamen2 2.
@372 ho2homeamen3 2.
@374 ho2bathprivt 2.
@376 ho2bathamen1 2.
@378 ho2bathamen2 2.
@380 ho2bathamen3 2.
@382 ho2bathamen4 2.
@384 ho2bathamen5 2.
@386 ho2bathamen6 2.
@388 ho2bathamen7 2.
@390 ho2kitchnprv 2.
@392 ho2kitchncom 2.
@394 ho2microwave 2.
@396 ho2dbldg1 2.
@398 ho2dbldg2 2.
@400 ho2dbldg3 2.
@402 ho2dbldg4 2.
@404 ho2dbathprvt 2.
@406 ho2dkitchnpr 2.
@408 ho2dkitchnco 2.
@410 fl2onefloor 2.
@412 fl2bathgrbbr 2.
@414 fl2bathseat 2.
@416 fl2raisedtlt 2.
@418 fl2tltgrbbr 2.
@420 em2modhere1 2.
@422 em2addlstyr1 2.
@424 em2addlstyr2 2.
@426 em2addlstyr3 2.
@428 em2addlstyr4 2.
@430 em2addlstyr5 2.
@432 em2addlstyr6 2.
@434 em2addlstyr7 2.
@436 em2payyufam1 2.
@438 em2payyufam2 2.
@440 em2payyufam3 2.
@442 em2payyufam4 2.
@444 em2payyufam5 2.
@446 em2payyufam6 2.
@448 em2payyufam7 2.
@450 em2paydevce1 2.
@452 em2paydevce2 2.
@454 em2paydevce3 2.
@456 em2paydevce4 2.
@458 em2paydevce5 2.
@460 em2paydevce6 2.
@462 em2paydevce7 2.
@464 em2paydevce8 2.
@466 em2paydevce9 2.
@468 em2payaltgth 2.
@470 em2morls1000 2.
@472 em2morls100 2.
@474 cm2knowwell 2.
@476 cm2willnghlp 2.
@478 cm2peoptrstd 2.
@480 te2cellphone 2.
@482 te2othrphone 2.
@484 te2computer 2.
@486 te2compoth 2.
@488 te2emailtext 2.
@490 te2oftnemail 2.
@492 te2online 2.
@494 te2shoponli1 2.
@496 te2shoponli2 2.
@498 te2shoponli3 2.
@500 te2intrntmd1 2.
@502 te2intrntmd2 2.
@504 te2intrntmd3 2.
@506 md2canewlker 2.
@508 md2cane 2.
@510 md2walker 2.
@512 md2wheelchar 2.
@514 md2whelcrspc 2.
@516 md2scooter 2.
@518 md2scterinsp 2.
@520 fl2cane 2.
@522 fl2walker 2.
@524 fl2wheelchr 2.
@526 fl2whlchrhom 2.
@528 fl2scooter 2.
@530 fl2scooterhm 2.
@532 ss2heringaid 2.
@534 ss2hearphone 2.
@536 ss2convwradi 2.
@538 ss2convquiet 2.
@540 ss2glasseswr 2.
@542 ss2seewellst 2.
@544 ss2seestvgls 2.
@546 ss2glasscls 2.
@548 ss2othvisaid 2.
@550 ss2glrednewp 2.
@552 ss2probchswl 2.
@554 ss2probspeak 2.
@556 ss2painbothr 2.
@558 ss2painlimts 2.
@560 ss2painmedof 2.
@562 ss2painwhe1 2.
@564 ss2painwhe2 2.
@566 ss2painwhe3 2.
@568 ss2painwhe4 2.
@570 ss2painwhe5 2.
@572 ss2painwhe6 2.
@574 ss2painwhe7 2.
@576 ss2painwhe8 2.
@578 ss2painwhe9 2.
@580 ss2painwhe10 2.
@582 ss2painwhe11 2.
@584 ss2painwhe12 2.
@586 ss2painwhe13 2.
@588 ss2probbreat 2.
@590 ss2prbbrlimt 2.
@592 ss2strnglmup 2.
@594 ss2uplimtact 2.
@596 ss2lwrbodstr 2.
@598 ss2lwrbodimp 2.
@600 ss2lowenergy 2.
@602 ss2loenlmtat 2.
@604 ss2prbbalcrd 2.
@606 ss2prbbalcnt 2.
@608 fl2deaf 2.
@610 fl2blind 2.
@612 pc2walk6blks 2.
@614 pc2walk3blks 2.
@616 pc2up20stair 2.
@618 pc2up10stair 2.
@620 pc2car20pnds 2.
@622 pc2car10pnds 2.
@624 pc2geonknees 2.
@626 pc2bendover 2.
@628 pc2hvobovrhd 2.
@630 pc2rechovrhd 2.
@632 pc2opnjarwhd 2.
@634 pc2grspsmobj 2.
@636 cp2memrygood 2.
@638 cp2knownspyr 2.
@640 cp2chgthink1 2.
@642 cp2chgthink2 2.
@644 cp2chgthink3 2.
@646 cp2chgthink4 2.
@648 cp2chgthink5 2.
@650 cp2chgthink6 2.
@652 cp2chgthink7 2.
@654 cp2chgthink8 2.
@656 cp2memcogpr1 2.
@658 cp2memcogpr2 2.
@660 cp2memcogpr3 2.
@662 cp2memcogpr4 2.
@664 cp2dad8dem 2.
@666 cg2speaktosp 2.
@668 cg2quesremem 2.
@670 cg2reascano1 2.
@672 cg2reascano2 2.
@674 cg2reascano3 2.
@676 cg2reascano4 2.
@678 cg2reascano5 2.
@680 cg2reascano6 2.
@682 cg2reascano7 2.
@684 cg2reascano8 2.
@686 cg2reascano9 2.
@688 cg2ratememry 2.
@690 cg2ofmemprob 2.
@692 cg2memcom1yr 2.
@694 cg2todaydat1 2.
@696 cg2todaydat2 2.
@698 cg2todaydat3 2.
@700 cg2todaydat5 2.
@702 cg2todaydat4 2.
@704 cg2todaydat6 2.
@706 cg2prewrdrcl 2.
@708 cg2dwrdlstnm 2.
@710 cg2wrdsrcal1 2.
@712 cg2wrdsrcal2 2.
@714 cg2wrdsrcal3 2.
@716 cg2wrdsrcal4 2.
@718 cg2wrdsrcal5 2.
@720 cg2wrdsrcal6 2.
@722 cg2wrdsrcal7 2.
@724 cg2wrdsrcal8 2.
@726 cg2wrdsrcal9 2.
@728 cg2wrdsrca10 2.
@730 cg2dwrdimmrc 2.
@732 cg2dwrdinone 2.
@734 cg2dwrdirref 2.
@736 cg2wrdsntlst 2.
@738 cg2numnotlst 2.
@740 cg2probreca1 2.
@742 cg2probreca2 2.
@744 cg2probreca3 2.
@746 cg2probreca4 2.
@748 cg2probreca5 2.
@750 cg2dclkdraw 2.
@752 cg2dclkimgcl 2.
@754 cg2atdrwclck 2.
@756 cg2presidna1 2.
@758 cg2presidna2 2.
@760 cg2presidna3 2.
@762 cg2presidna4 2.
@764 cg2vpname1 2.
@766 cg2vpname2 2.
@768 cg2vpname3 2.
@770 cg2vpname4 2.
@772 cg2wrdsdcal1 2.
@774 cg2wrdsdcal2 2.
@776 cg2wrdsdcal3 2.
@778 cg2wrdsdcal4 2.
@780 cg2wrdsdcal5 2.
@782 cg2wrdsdcal6 2.
@784 cg2wrdsdcal7 2.
@786 cg2wrdsdcal8 2.
@788 cg2wrdsdcal9 2.
@790 cg2wrdsdca10 2.
@792 cg2dwrddlyrc 2.
@794 cg2dwrddnone 2.
@796 cg2dwrddrref 2.
@798 cg2wrdnotlst 2.
@800 cg2numwrdnot 2.
@802 cg2dwrd1rcl 2.
@804 cg2dwrd2rcl 2.
@806 cg2dwrd3rcl 2.
@808 cg2dwrd4rcl 2.
@810 cg2dwrd5rcl 2.
@812 cg2dwrd6rcl 2.
@814 cg2dwrd7rcl 2.
@816 cg2dwrd8rcl 2.
@818 cg2dwrd9rcl 2.
@820 cg2dwrd10rcl 2.
@822 cg2dwrd1dly 2.
@824 cg2dwrd2dly 2.
@826 cg2dwrd3dly 2.
@828 cg2dwrd4dly 2.
@830 cg2dwrd5dly 2.
@832 cg2dwrd6dly 2.
@834 cg2dwrd7dly 2.
@836 cg2dwrd8dly 2.
@838 cg2dwrd9dly 2.
@840 cg2dwrd10dly 2.
@842 mo2outoft 2.
@844 mo2outcane 2.
@846 mo2outwalkr 2.
@848 mo2outwlchr 2.
@850 mo2outsctr 2.
@852 mo2outhlp 2.
@854 mo2outslf 2.
@856 mo2outdif 2.
@858 mo2outyrgo 2.
@860 mo2outwout 2.
@862 mo2oftgoarea 2.
@864 mo2oflvslepr 2.
@866 mo2insdcane 2.
@868 mo2insdwalkr 2.
@870 mo2insdwlchr 2.
@872 mo2insdsctr 2.
@874 mo2oftholdwl 2.
@876 mo2insdhlp 2.
@878 mo2insdslf 2.
@880 mo2insddif 2.
@882 mo2insdyrgo 2.
@884 mo2insdwout 2.
@886 mo2beddev 2.
@888 mo2bedhlp 2.
@890 mo2bedslf 2.
@892 mo2beddif 2.
@894 mo2bedwout 2.
@896 mo2doutsfdf 2.
@898 mo2doutdevi 2.
@900 mo2douthelp 2.
@902 mo2dinsdsfdf 2.
@904 mo2dinsddevi 2.
@906 mo2dinsdhelp 2.
@908 mo2dbedsfdf 2.
@910 mo2dbeddevi 2.
@912 mo2dbedhelp 2.
@914 fl2didntleav 2.
@916 fl2ntlvrmslp 2.
@918 dm2helpmobil 2.
@920 dm2helpstmo 2.
@922 dm2helpstyr 4.
@926 dm2helpendmo 2.
@928 dm2helpendyr 4.
@932 dm2nohelp 2.
@934 dm2nohelpmos 2.
@936 dm2lstyrcane 4.
@940 dm2devstmo 2.
@942 dm2devstyr 4.
@946 dm2devendmo 2.
@948 dm2devendyr 4.
@952 dm2nodev 2.
@954 dm2nodevmos 2.
@956 dmds2dintvl 2.
@958 dm2dmohlp 3.
@961 dm2dmodev 3.
@964 dm2dmohlpgr 2.
@966 dm2dmodevgr 2.
@968 dm2flag 2.
@970 dt2driveyr 2.
@972 dt2oftedrive 2.
@974 dt2avoidriv1 2.
@976 dt2avoidriv2 2.
@978 dt2avoidriv3 2.
@980 dt2avoidriv4 2.
@982 dt2getoplcs1 2.
@984 dt2getoplcs2 2.
@986 dt2getoplcs3 2.
@988 dt2getoplcs4 2.
@990 dt2getoplcs5 2.
@992 dt2getoplcs6 2.
@994 dt2getoplcs7 2.
@996 dt2otfrfamtk 2.
@998 fl1dneverdrv 2.
@1000 fl2drives 2.
@1002 fl2drvlstyr 2.
@1004 ha2laun 2.
@1006 ha2launslf 2.
@1008 ha2whrmachi1 2.
@1010 ha2whrmachi2 2.
@1012 ha2whrmachi3 2.
@1014 ha2whrmachi4 2.
@1016 ha2whrmachi5 2.
@1018 ha2whrmachi6 2.
@1020 ha2dlaunreas 2.
@1022 ha2laundif 2.
@1024 ha2launoft 2.
@1026 ha2launwout 2.
@1028 ha2shop 2.
@1030 ha2shopslf 2.
@1032 ha2howpaygr1 2.
@1034 ha2howpaygr2 2.
@1036 ha2howpaygr3 2.
@1038 ha2howpaygr4 2.
@1040 ha2howpaygr5 2.
@1042 ha2howpaygr6 2.
@1044 ha2howpaygr7 2.
@1046 ha2howgtstr1 2.
@1048 ha2howgtstr2 2.
@1050 ha2howgtstr3 2.
@1052 ha2howgtstr4 2.
@1054 ha2howgtstr5 2.
@1056 ha2howgtstr6 2.
@1058 ha2howgtstr7 2.
@1060 ha2howgtstr8 2.
@1062 ha2shopcart 2.
@1064 ha2shoplean 2.
@1066 ha2dshopreas 2.
@1068 ha2shopdif 2.
@1070 ha2shopoft 2.
@1072 ha2shopwout 2.
@1074 ha2meal 2.
@1076 ha2mealslf 2.
@1078 ha2restamels 2.
@1080 ha2oftmicrow 2.
@1082 ha2dmealreas 2.
@1084 ha2mealdif 2.
@1086 ha2mealoft 2.
@1088 ha2mealwout 2.
@1090 ha2bank 2.
@1092 ha2bankslf 2.
@1094 ha2dbankreas 2.
@1096 ha2bankdif 2.
@1098 ha2bankoft 2.
@1100 ha2bankwout 2.
@1102 ha2money 2.
@1104 ha2moneyhlp 2.
@1106 ha2dlaunsfdf 2.
@1108 ha2dshopsfdf 2.
@1110 ha2dmealsfdf 2.
@1112 ha2dbanksfdf 2.
@1114 ha2dmealwhl 2.
@1116 ha2dmealtkot 2.
@1118 sc2eatdev 2.
@1120 sc2eatdevoft 2.
@1122 sc2eathlp 2.
@1124 sc2eatslfoft 2.
@1126 sc2eatslfdif 2.
@1128 sc2eatwout 2.
@1130 sc2showrbat1 2.
@1132 sc2showrbat2 2.
@1134 sc2showrbat3 2.
@1136 sc2bdevdec 2.
@1138 sc2prfrshbth 2.
@1140 sc2scusgrbrs 2.
@1142 sc2shtubseat 2.
@1144 sc2bathhlp 2.
@1146 sc2bathoft 2.
@1148 sc2bathdif 2.
@1150 sc2bathyrgo 2.
@1152 sc2bathwout 2.
@1154 sc2usvartoi1 2.
@1156 sc2usvartoi2 2.
@1158 sc2usvartoi3 2.
@1160 sc2usvartoi4 2.
@1162 sc2toilhlp 2.
@1164 sc2toiloft 2.
@1166 sc2toildif 2.
@1168 sc2toilwout 2.
@1170 sc2dresoft 2.
@1172 sc2dresdev 2.
@1174 sc2dreshlp 2.
@1176 sc2dresslf 2.
@1178 sc2dresdif 2.
@1180 sc2dresyrgo 2.
@1182 sc2dreswout 2.
@1184 sc2deatdevi 2.
@1186 sc2deathelp 2.
@1188 sc2deatsfdf 2.
@1190 sc2dbathdevi 2.
@1192 sc2dbathhelp 2.
@1194 sc2dbathsfdf 2.
@1196 sc2dtoildevi 2.
@1198 sc2dtoilhelp 2.
@1200 sc2dtoilsfdf 2.
@1202 sc2ddresdevi 2.
@1204 sc2ddreshelp 2.
@1206 sc2ddressfdf 2.
@1208 fl2showering 2.
@1210 fl2takingbth 2.
@1212 fl2washingup 2.
@1214 ds2gethlpeat 2.
@1216 ds2helpstmo 2.
@1218 ds2helpstyr 2.
@1220 ds2helpendmo 2.
@1222 ds2helpendyr 2.
@1224 ds2nohelp 2.
@1226 ds2nohelpmos 2.
@1228 ds2dschlp 3.
@1231 ds2dschlpgr 2.
@1233 ds2flag 2.
@1235 mc2meds 2.
@1237 mc2medstrk 2.
@1239 mc2medsslf 2.
@1241 mc2whrgtmed1 2.
@1243 mc2whrgtmed2 2.
@1245 mc2whrgtmed3 2.
@1247 mc2whrgtmed4 2.
@1249 mc2howpkupm1 2.
@1251 mc2howpkupm2 2.
@1253 mc2howpkupm3 2.
@1255 mc2medsrem 2.
@1257 mc2dmedsreas 2.
@1259 mc2medsdif 2.
@1261 mc2medsyrgo 2.
@1263 mc2medsmis 2.
@1265 mc2havregdoc 2.
@1267 mc2regdoclyr 2.
@1269 mc2hwgtregd1 2.
@1271 mc2hwgtregd2 2.
@1273 mc2hwgtregd3 2.
@1275 mc2hwgtregd4 2.
@1277 mc2hwgtregd5 2.
@1279 mc2hwgtregd6 2.
@1281 mc2hwgtregd7 2.
@1283 mc2hwgtregd8 2.
@1285 mc2hwgtregd9 2.
@1287 mc2ansitindr 2.
@1289 mc2tpersevr1 2.
@1291 mc2tpersevr2 2.
@1293 mc2tpersevr3 2.
@1295 mc2tpersevr4 2.
@1297 mc2chginspln 2.
@1299 mc2anhlpwdec 2.
@1301 mc2dmedssfdf 2.
@1303 pa2vistfrfam 2.
@1305 pa2hlkepfvst 2.
@1307 pa2trkpfrvis 2.
@1309 pa2impvstfam 2.
@1311 pa2attrelser 2.
@1313 pa2htkfrrlsr 2.
@1315 pa2trprrelsr 2.
@1317 pa2imprelser 2.
@1319 pa2clbmtgrac 2.
@1321 pa2hlkpfrclb 2.
@1323 pa2trprkpfgr 2.
@1325 pa2imparclub 2.
@1327 pa2outfrenjy 2.
@1329 pa2hlkpgoenj 2.
@1331 pa2trprgoout 2.
@1333 pa2impouteny 2.
@1335 pa2workfrpay 2.
@1337 pa2hlkpfrwrk 2.
@1339 pa2voltrwork 2.
@1341 pa2hlkpfrvol 2.
@1343 pa2prcranoth 2.
@1345 pa2evrgowalk 2.
@1347 pa2vigoractv 2.
@1349 pa2dofavact 2.
@1351 pa2helmfvact 3.
@1354 pa1dv2favact 3.
@1357 sd2smokesnow 2.
@1359 sd2numcigday 3.
@1362 pe2whhndsign 2.
@1364 pe2surghdwrt 2.
@1366 pe2surgyside 2.
@1368 pe2flruppain 2.
@1370 pe2sideflrup 2.
@1372 pe2surgarmsh 2.
@1374 pe2sidsurgar 2.
@1376 pe2surgyhips 2.
@1378 pe2sidhipsrg 2.
@1380 pe2stndwhold 2.
@1382 pe2upchbyslf 2.
@1384 pe2wlkdsself 2.
@1386 fl2lefthand 2.
@1388 fl2righthand 2.
@1390 fl2eiherhand 2.
@1392 fl2lftgrptst 2.
@1394 fl2rhtgrptst 2.
@1396 fl2charstnds 2.
@1398 fl2balstands 2.
@1400 fl2wlkingrse 2.
@1402 ba2dblssadm 2.
@1404 ba2dblstadm 2.
@1406 ba2dblftadm 2.
@1408 ba2dblopadm 2.
@1410 ba2dblcladm 2.
@1412 wa2dwlkadm 2.
@1414 ch2dschradm 2.
@1416 ch2drchradm 2.
@1418 gr2dgripadm 2.
@1420 wc2dwaistadm 2.
@1422 pk2dpeakadm 2.
@1424 ab2datemonth 2.
@1426 ab2dateyear 4.
@1430 in2strtabhrs 4.
@1434 in2strtabmin 4.
@1438 in2strtmampm 2.
@1440 ba2sxsresult 2.
@1442 ba2blstdsecs 2.
@1444 ba2blstdhndr 2.
@1446 ba2rsn1ssstd 2.
@1448 ba2rsn2ssstd 2.
@1450 ba2rsn3ssstd 2.
@1452 ba2rsn4ssstd 2.
@1454 ba2rsn9ssstd 2.
@1456 ba2stdmreslt 2.
@1458 ba2stdmsecs 2.
@1460 ba2stdmhndr 2.
@1462 ba2rsn1ststd 2.
@1464 ba2rsn2ststd 2.
@1466 ba2rsn3ststd 2.
@1468 ba2rsn4ststd 2.
@1470 ba2rsn9ststd 2.
@1472 ba2ftdmreslt 2.
@1474 ba2ftdmsecs 2.
@1476 ba2ftdmhndr 2.
@1478 ba2rsn1ftstd 2.
@1480 ba2rsn2ftstd 2.
@1482 ba2rsn3ftstd 2.
@1484 ba2rsn4ftstd 2.
@1486 ba2rsn9ftstd 2.
@1488 ba21leoreslt 2.
@1490 ba21leosfsec 2.
@1492 ba21leohndr 2.
@1494 ba2rsn11leo 2.
@1496 ba2rsn21leo 2.
@1498 ba2rsn31leo 2.
@1500 ba2rsn41leo 2.
@1502 ba2rsn91leo 2.
@1504 ba21lecreslt 2.
@1506 ba21lecsfsec 2.
@1508 ba21lechndr 2.
@1510 ba2rsn11lec 2.
@1512 ba2rsn21lec 2.
@1514 ba2rsn31lec 2.
@1516 ba2rsn41lec 2.
@1518 ba2rsn91lec 2.
@1520 wa2wlkcorspc 2.
@1522 wa2wkaidused 2.
@1524 wa2wlkc1rslt 2.
@1526 wa2wlkc1secs 4.
@1530 wa2wlk1hndr 4.
@1534 wa2rsn11wkc 2.
@1536 wa2rsn21wkc 2.
@1538 wa2rsn31wkc 2.
@1540 wa2rsn41wkc 2.
@1542 wa2rsn51wkc 2.
@1544 wa2rsn91wkc 2.
@1546 wa2wkaidusc2 2.
@1548 wa2wlkc2rslt 2.
@1550 wa2wlkc2secs 4.
@1554 wa2wlk2hndr 4.
@1558 wa2rsn12wkc 2.
@1560 wa2rsn22wkc 2.
@1562 wa2rsn32wkc 2.
@1564 wa2rsn42wkc 2.
@1566 wa2rsn92wkc 2.
@1568 ch2chravail 2.
@1570 ch2chstcompl 2.
@1572 ch2chairheit 3.
@1575 ch2whlchrusd 2.
@1577 ch2sgchstres 2.
@1579 ch2armuse 2.
@1581 ch2rsn11chs 2.
@1583 ch2rsn21chs 2.
@1585 ch2rsn31chs 2.
@1587 ch2rsn41chs 2.
@1589 ch2rsn51chs 2.
@1591 ch2rsn91chs 2.
@1593 ch22chstrslt 2.
@1595 ch2chstndsec 3.
@1598 ch2chstdhndr 3.
@1601 ch2chstddone 2.
@1603 ch2chstntdn1 2.
@1605 ch2chstntdn2 2.
@1607 ch2chstntdn3 2.
@1609 ch2chstntdn4 2.
@1611 ch2chstntdn5 2.
@1613 ch2chstntdn9 2.
@1615 ch2chstntat1 2.
@1617 ch2chstntat2 2.
@1619 ch2chstntat3 2.
@1621 ch2chstntat4 2.
@1623 ch2chstntat9 2.
@1625 gr2handtstd1 2.
@1627 gr2adjgr1ps3 2.
@1629 gr2grp1reslt 2.
@1631 gr2grp1rdng 6.3
@1637 gr2grp1noat1 2.
@1639 gr2grp1noat2 2.
@1641 gr2grp1noat3 2.
@1643 gr2grp1noat4 2.
@1645 gr2grp1noat9 2.
@1647 gr2handtstd2 2.
@1649 gr2adjgr2ps3 2.
@1651 gr2grp2reslt 2.
@1653 gr2grp2rdng 6.3
@1659 gr2grp2noat1 2.
@1661 gr2grp2noat2 2.
@1663 gr2grp2noat3 2.
@1665 gr2grp2noat4 2.
@1667 gr2grp2noat9 2.
@1669 wc2measdiff1 2.
@1671 wc2measdiff2 2.
@1673 wc2measdiff3 2.
@1675 wc2measdiff4 2.
@1677 wc2measdiff5 2.
@1679 wc2measdiff6 2.
@1681 wc2measdiff9 2.
@1683 wc2waistrslt 4.
@1687 wc2wstmsrinc 4.
@1691 wc2wstmsrqrt 4.
@1695 wc2wstbulkcl 2.
@1697 wc2whomeasur 2.
@1699 wc2wstpostn 2.
@1701 wc2wstnotat1 2.
@1703 wc2wstnotat2 2.
@1705 wc2wstnotat3 2.
@1707 wc2wstnotat4 2.
@1709 wc2wstnotat5 2.
@1711 wc2wstnotat9 2.
@1713 pk2pkarf1pos 2.
@1715 pk2pkarfl1ef 2.
@1717 pk2pkarfl1rs 2.
@1719 pk2pkarfl1rd 3.
@1722 pk2pk1noatt1 2.
@1724 pk2pk1noatt2 2.
@1726 pk2pk1noatt3 2.
@1728 pk2pk1noatt4 2.
@1730 pk2pk1noatt9 2.
@1732 pk2paf2posit 2.
@1734 pk2pkarfl2ef 2.
@1736 pk2pkarfl2rs 2.
@1738 pk2pkarfl2rd 3.
@1741 pk2pk2noatt1 2.
@1743 pk2pk2noatt2 2.
@1745 pk2pk2noatt3 2.
@1747 pk2pk2noatt4 2.
@1749 pk2pk2noatt9 2.
@1751 cl2endtimhrs 2.
@1753 cl2endtimmin 4.
@1757 cl2endtmampm 2.
@1759 R2DNHATSSPPB 4.
@1763 R2DNHATSBASC 4.
@1767 R2DNHATSWKSC 4.
@1771 R2DNHATSCHSC 4.
@1775 R2DNHATSGRAV 8.
@1783 R2DNHATSGRB 8.
@1791 R2DNHATSPKAV 8.
@1799 R2DNHATSPKB 8.
@1807 R2DSPPBMISS 2.
@1809 R2DORIGSPPB 2.
@1811 r2dorigbasc 2.
@1813 r2dorigwksc 2.
@1815 r2dorigchsc 2.
@1817 hw2currweigh 3.
@1820 hw2lst10pnds 2.
@1822 hw2trytolose 2.
@1824 hw2howtallft 2.
@1826 hw2howtallin 3.
@1829 el2mothalive 2.
@1831 el2fathalive 2.
@1833 wb2offelche1 2.
@1835 wb2offelche2 2.
@1837 wb2offelche3 2.
@1839 wb2offelche4 2.
@1841 wb2truestme1 2.
@1843 wb2truestme2 2.
@1845 wb2truestme3 2.
@1847 wb2truestme4 2.
@1849 wb2ageyofeel 3.
@1852 wb2agrwstmt1 2.
@1854 wb2agrwstmt2 2.
@1856 wb2agrwstmt3 2.
@1858 ip2covmedcad 2.
@1860 ip2otdrugcov 2.
@1862 ip2mgapmedsp 2.
@1864 ip2cmedicaid 2.
@1866 ip2covtricar 2.
@1868 ip2nginslast 2.
@1870 ip2nginsnurs 2.
@1872 ip2typcarco1 2.
@1874 ip2typcarco2 2.
@1876 ip2typcarco3 2.
@1878 ip2paypremms 8.
@1886 lf2workfpay 2.
@1888 lf2abstlstwk 2.
@1890 lf2wrkplstmn 2.
@1892 lf2mrthnonjb 2.
@1894 lf2hrswkwork 4.
@1898 lf2hrwrkltwk 4.
@1902 lf2hrwrklstw 4.
@1906 lf2oftpaid 2.
@1908 lf2huswifwrk 8.
@1916 lf2doccup 4.
@1920 hp2ownrentot 2.
@1922 hp2mrtpadoff 2.
@1924 hp2mthlymort 8.
@1932 hp2mortpaymt 8.
@1940 hp2whnpayoff 4.
@1944 hp2amtstlowe 8.
@1952 hp2amoutowed 8.
@1960 hp2homevalue 8.
@1968 hp2homvalamt 8.
@1976 hp2payrent 2.
@1978 hp2rentamt 8.
@1986 hp2rentamout 8.
@1994 hp2sec8pubsn 8.
@2002 ew2pycredbal 2.
@2004 ew2crecardeb 2.
@2006 ew2credcdmed 2.
@2008 ew2amtcrdmed 2.
@2010 ew2medpaovtm 2.
@2012 ew2ampadovrt 2.
@2014 ew2finhlpfam 2.
@2016 ew2whohelfi1 2.
@2018 ew2whohelfi2 2.
@2020 ew2atchhelyr 2.
@2022 ew2fingftfam 2.
@2024 ew2whregoth1 2.
@2026 ew2whregoth2 2.
@2028 ew2whregoth3 2.
@2030 ew2amthlpgiv 2.
@2032 ew2progneed1 2.
@2034 ew2progneed2 2.
@2036 ew2progneed3 2.
@2038 ew2mealskip1 2.
@2040 ew2mealskip2 2.
@2042 ew2nopayhous 2.
@2044 ew2nopayutil 2.
@2046 ew2nopaymed 2.
@2048 ad2heardif 2.
@2050 ad2seedif 2.
@2052 ad2concdif 2.
@2054 ad2walkdif 2.
@2056 ad2dresdif 2.
@2058 ad2erranddif 2.
@2060 eh2advicedoc 2.
@2062 eh2advicefam 2.
@2064 eh2medmgmt 2.
@2066 eh2meddif 2.
@2068 eh2medfamdif 2.
@2070 eh2meddelay 2.
@2072 eh2medtoomch 2.
@2074 ep2eoltalk 2.
@2076 ep2eoltalk2 2.
@2078 ep2eoltalk3 2.
@2080 ep2eoltalk4 2.
@2082 ep2eoltalk5 2.
@2084 ep2eoltalk6 2.
@2086 ep2eoltalk7 2.
@2088 ep2eoltalk8 2.
@2090 ep2eoltalk9 2.
@2092 ep2eoltalk10 2.
@2094 ep2eoltalk11 2.
@2096 ep2eoltalk12 2.
@2098 ep2eoltalk13 2.
@2100 ep2eoltalk14 2.
@2102 ep2eoltalk15 2.
@2104 ep2eoltalk16 2.
@2106 ep2eoltalk17 2.
@2108 ep2eoltalk18 2.
@2110 ep2eoltalk19 2.
@2112 ep2eoltalk20 2.
@2114 ep2eoltalk21 2.
@2116 ep2eoltalk22 2.
@2118 ep2eoltalk23 2.
@2120 ep2eoltalk24 2.
@2122 ep2eoltalk25 2.
@2124 ep2eoltalk26 2.
@2126 ep2eoltalk27 2.
@2128 ep2eoltalk28 2.
@2130 ep2eoltalk29 2.
@2132 ep2eoltalk30 2.
@2134 ep2eoltalk31 2.
@2136 ep2eoltalk32 2.
@2138 ep2eoltalk33 2.
@2140 ep2eoltalk34 2.
@2142 ep2eoltalk35 2.
@2144 ep2eoltalk36 2.
@2146 ep2eoltalk37 2.
@2148 ep2eoltalk38 2.
@2150 ep2eoltalk39 2.
@2152 ep2eoltalk40 2.
@2154 ep2eoltalk91 2.
@2156 ep2eoltalk92 2.
@2158 ep2poweratty 2.
@2160 ep2eolpow2 2.
@2162 ep2eolpow3 2.
@2164 ep2eolpow4 2.
@2166 ep2eolpow5 2.
@2168 ep2eolpow6 2.
@2170 ep2eolpow7 2.
@2172 ep2eolpow8 2.
@2174 ep2eolpow9 2.
@2176 ep2eolpow10 2.
@2178 ep2eolpow11 2.
@2180 ep2eolpow12 2.
@2182 ep2eolpow13 2.
@2184 ep2eolpow14 2.
@2186 ep2eolpow15 2.
@2188 ep2eolpow16 2.
@2190 ep2eolpow17 2.
@2192 ep2eolpow18 2.
@2194 ep2eolpow19 2.
@2196 ep2eolpow20 2.
@2198 ep2eolpow21 2.
@2200 ep2eolpow22 2.
@2202 ep2eolpow23 2.
@2204 ep2eolpow24 2.
@2206 ep2eolpow25 2.
@2208 ep2eolpow26 2.
@2210 ep2eolpow27 2.
@2212 ep2eolpow28 2.
@2214 ep2eolpow29 2.
@2216 ep2eolpow30 2.
@2218 ep2eolpow31 2.
@2220 ep2eolpow32 2.
@2222 ep2eolpow33 2.
@2224 ep2eolpow34 2.
@2226 ep2eolpow35 2.
@2228 ep2eolpow36 2.
@2230 ep2eolpow37 2.
@2232 ep2eolpow38 2.
@2234 ep2eolpow39 2.
@2236 ep2eolpow40 2.
@2238 ep2eolpow91 2.
@2240 ep2eolpow92 2.
@2242 ep2livngwill 2.
@2244 ep2paintrmnt 2.
@2246 ep2talktrmnt 2.
@2248 ep2bstcre 2.
@2250 ep2sndbstcre 2.
@2252 ep2money 2.
@2254 ir2intlang 2.
@2256 ir2spattitud 2.
@2258 ir2undrstand 2.
@2260 ir2sppresent 2.
@2262 ir2spnotprs1 2.
@2264 ir2spnotprs2 2.
@2266 ir2spnotprs3 2.
@2268 ir2spnotprs4 2.
@2270 ir2spnotprs5 2.
@2272 ir2spnotprs6 2.
@2274 ir2intvwhlp 2.
@2276 ir2prsnhlp1 2.
@2278 ir2prsnhlp2 2.
@2280 ir2prsnhlp3 2.
@2282 ir2prsnhlp4 2.
@2284 ir2prsnhlp5 2.
@2286 ir2prsnhlp6 2.
@2288 ir2prsnhlp91 2.
@2290 ir2demolang1 2.
@2292 ir2strprob 2.
@2294 ir2sessions 2.
@2296 ir2sessrsn1 2.
@2298 ir2sessrsn2 2.
@2300 ir2sessrsn3 2.
@2302 ir2sessrsn91 2.
@2304 ir2conhomapt 2.
@2306 ir2insidhome 2.
@2308 ir2condihom1 2.
@2310 ir2condihom2 2.
@2312 ir2condihom3 2.
@2314 ir2condihom4 2.
@2316 ir2condihom5 2.
@2318 ir2clutterr1 2.
@2320 ir2clutterr2 2.
@2322 ir2areacond1 2.
@2324 ir2areacond2 2.
@2326 ir2areacond3 2.
@2328 ir2condhome1 2.
@2330 ir2condhome2 2.
@2332 ir2condhome3 2.
@2334 ir2condhome4 2.
@2336 ir2condhome5 2.
@2338 ir2condhome6 2.
@2340 r2stroopmean 16.10
@2356 r2strooprati 16.10
@2372 r2stroopgrp 4.
@2376 fq2dfacdescr 2.
@2378 fq2dosfacd 2.
@2380 fq2prtlivnam 2.
@2382 fq2dfacarea 2.
@2384 fq2dosfaca 2.
@2386 fq2assdnrsng 2.
@2388 fq2othrlevls 2.
@2390 fq2whotlevl1 2.
@2392 fq2whotlevl2 2.
@2394 fq2whotlevl3 2.
@2396 fq2whotlevl4 2.
@2398 fq2whotlevl5 2.
@2400 fq2servaval1 2.
@2402 fq2servaval2 2.
@2404 fq2servaval3 2.
@2406 fq2servaval4 2.
@2408 fq2servaval5 2.
@2410 fq2servaval6 2.
@2412 fq2servaval7 2.
@2414 fq2servaval8 2.
@2416 fq2servaval9 2.
@2418 fq2paysourc1 6.
@2424 fq2paysourc2 6.
@2430 fq2paysourc3 6.
@2436 fq2paysourc4 6.
@2442 fq2paysourc5 6.
@2448 fq2paysourc6 6.
@2454 fq2totalpaym 2.
@2456 fq2mnthlyamt 4.
@2460 fq2primpayer 2.
@2462 fq2govsource 2.
@2464 fq2dlocsp 2.
@2466 W2ANFINWGT0 18.11
@2484 W2ANFINWGT1 18.11
@2502 W2ANFINWGT2 18.11
@2520 W2ANFINWGT3 18.11
@2538 W2ANFINWGT4 18.11
@2556 W2ANFINWGT5 18.11
@2574 W2ANFINWGT6 18.11
@2592 W2ANFINWGT7 18.11
@2610 W2ANFINWGT8 18.11
@2628 W2ANFINWGT9 18.11
@2646 W2ANFINWGT10 18.11
@2664 W2ANFINWGT11 18.11
@2682 W2ANFINWGT12 18.11
@2700 W2ANFINWGT13 18.11
@2718 W2ANFINWGT14 18.11
@2736 W2ANFINWGT15 18.11
@2754 W2ANFINWGT16 18.11
@2772 W2ANFINWGT17 18.11
@2790 W2ANFINWGT18 18.11
@2808 W2ANFINWGT19 18.11
@2826 W2ANFINWGT20 18.11
@2844 W2ANFINWGT21 18.11
@2862 W2ANFINWGT22 18.11
@2880 W2ANFINWGT23 18.11
@2898 W2ANFINWGT24 18.11
@2916 W2ANFINWGT25 18.11
@2934 W2ANFINWGT26 18.11
@2952 W2ANFINWGT27 18.11
@2970 W2ANFINWGT28 18.11
@2988 W2ANFINWGT29 18.11
@3006 W2ANFINWGT30 18.11
@3024 W2ANFINWGT31 18.11
@3042 W2ANFINWGT32 18.11
@3060 W2ANFINWGT33 18.11
@3078 W2ANFINWGT34 18.11
@3096 W2ANFINWGT35 18.11
@3114 W2ANFINWGT36 18.11
@3132 W2ANFINWGT37 18.11
@3150 W2ANFINWGT38 18.11
@3168 W2ANFINWGT39 18.11
@3186 W2ANFINWGT40 18.11
@3204 W2ANFINWGT41 18.11
@3222 W2ANFINWGT42 18.11
@3240 W2ANFINWGT43 18.11
@3258 W2ANFINWGT44 18.11
@3276 W2ANFINWGT45 18.11
@3294 W2ANFINWGT46 18.11
@3312 W2ANFINWGT47 18.11
@3330 W2ANFINWGT48 18.11
@3348 W2ANFINWGT49 18.11
@3366 W2ANFINWGT50 18.11
@3384 W2ANFINWGT51 18.11
@3402 W2ANFINWGT52 18.11
@3420 W2ANFINWGT53 18.11
@3438 W2ANFINWGT54 18.11
@3456 W2ANFINWGT55 18.11
@3474 W2ANFINWGT56 18.11
@3492 w2varstrat 2.
@3494 w2varunit 2.;

/* Section #3 - format assignment statement   */
format 
r2dlmlint DLMLINT.
r2dresid F_DRESID.
r1dresid R1DRESID.
r2dresidlml D_LMLLOC.
r2breakoffst RFDK_B.
r2breakoffqt $RFDK_2C.
is2resptype W200030W.
is2reasnprx1 RFDK_YN.
is2reasnprx2 RFDK_YN.
is2reasnprx3 RFDK_YN.
is2reasnprx4 RFDK_YN.
is2reasnprx5 RFDK_YN.
is2reasnprx6 RFDK_YN.
is2reasnprx7 RFDK_YN.
is2reasnprx9 RFDK_YN.
is2tempres W200032W.
is2prxyrelat W200035W.
is2prxygendr W200002W.
is2famrrutin W200036W.
is2proxlivsp W200011W.
r2d2intvrage D2INTVRA.
is2dproxyid $RFDK_C.
re2spadrsnew W200037W.
re2intplace W200011W.
re2newstrct W200018W.
re2newblgfl W200021W.
re2mthmove W200038W.
re2yearmove W200039W.
re2placedec W200011W.
re2alonedec W200011W.
re2dadrscorr W200037W.
re2dresistrct W200018W.
re2dbldg W200021W.
re2dcensdiv CENDIV.
fl2structure W200020W.
fl2bldgfl W200021W.
fl2resnew W200011W.
fl2facility W200011W.
fl2hotype W200022W.
fl2retirecom W200011W.
pd2placedied W200041W.
pd2homedied W200042W.
pd2hospdied W200043W.
pd2hospice1 W200011W.
pd2hospice2 W200044W.
pd2stayunit W200045W.
pd2staydays RFDK_F.
pd2staywks RFDK_F.
pd2staymths RFDK_F.
pd2stayyrs RFDK_F.
pd2staymthpl W200011W.
pd2placepre W200046W.
pd2alert W200047W.
pd2outbed W200047W.
r2d2deathage D2INTVRA.
fl2spdied W200011W.
fl2notalert W200011W.
fl2notmobile W200011W.
lm2pain W200011W.
lm2painhlp W200011W.
lm2painhlpam W200048W.
lm2bre W200011W.
lm2brehlp W200011W.
lm2brehlpam W200048W.
lm2sad W200011W.
lm2sadhlp W200011W.
lm2sadhlpam W200048W.
lm2caredecis W200049W.
lm2carenowan W200049W.
lm2perscare W200050W.
lm2respect W200050W.
lm2informed W200050W.
lm2doctor W200049W.
lm2docclear W200011W.
lm2relg W200049W.
lm2relgamt W200011W.
lm2ratecare W200051W.
hc2health W200051W.
hc2disescn1 W200011W.
hc2disescn2 W200011W.
hc2disescn3 W200011W.
hc2disescn4 W200011W.
hc2disescn5 W200011W.
hc2disescn6 W200011W.
hc2disescn7 W200011W.
hc2disescn8 W200011W.
hc2disescn9 W200011W.
hc2disescn10 W200011W.
hc2brokebon1 W200011W.
hc2brokebon2 W200011W.
hc2hosptstay W200011W.
hc2hosovrnht RFDK_F.
hc2knesrgyr W200011W.
hc2hipsrgyr W200011W.
hc2catrsrgyr W200011W.
hc2backsrgyr W200011W.
hc2hartsrgyr W200011W.
hc2fllsinmth W200011W.
hc2worryfall W200011W.
hc2worrylimt W200011W.
hc2faleninyr W200011W.
hc2multifall W200011W.
hc2depresan1 W200052W.
hc2depresan2 W200052W.
hc2depresan3 W200052W.
hc2depresan4 W200052W.
hc2aslep30mn W200053W.
hc2trbfalbck W200054W.
hc2sleepmed W200053W.
ht2placedesc W200055W.
ht2retiresen W200011W.
ht2diffareun W200011W.
ht2helpmedbd W200011W.
ht2meals W200011W.
ht2spacename W200057W.
se2servcoff1 W200011W.
se2servcoff2 W200011W.
se2servcoff3 W200011W.
se2servcoff4 W200011W.
se2servcoff5 W200011W.
se2servcoff6 W200011W.
se2servcoff7 W200011W.
se2servcoff8 W200011W.
se2servcoff9 W200011W.
se2servused1 W200011W.
se2servused2 W200011W.
se2servused3 W200011W.
se2servused4 W200011W.
se2servused5 W200011W.
se2servused6 W200011W.
se2servused7 W200011W.
se2servused8 W200011W.
se2servused9 W200011W.
se2payservi1 W200147W.
se2payservi2 W200147W.
se2payservi3 W200147W.
se2payservi4 W200147W.
se2payservi5 W200147W.
se2payservi6 W200147W.
se2payservi7 W200147W.
se2payservi8 W200147W.
se2payservi9 W200147W.
hh2marchange W200011W.
hh2martlstat W200010W.
hh2yrendmarr W200039W.
hh2newspoprt W200058W.
hh2spgender W200002W.
hh2dspouage DSPSAGEC.
hh2dspageall DSPSAGEC.
hh2spouseduc W200005W.
hh2spoupchlp W200011W.
hh2livwthspo W200011W.
hh2placekind W200060W.
hh2dmarstat DMARSTAT.
hh2dlvngarrg LVGARRG.
hh2dhshldnum RFDK_F.
hh2dhshldchd RFDK_F.
hh2dspouseid $RFDK_C.
cs2sistrsnum RFDK_F.
cs2brthrsnum RFDK_F.
cs2dnumchild RFDK_F.
cs2dnmstpchd RFDK_F.
cs2dnumdaugh RFDK_F.
cs2dnumson RFDK_F.
sn2dnumsn RFDK_F.
fl2noonetalk W200011W.
ho2entrstair W200011W.
ho2entrccomn W200067W.
ho2entrnramp W200011W.
ho2bldgamen1 W200011W.
ho2bldgamen2 W200011W.
ho2bldgamen3 W200011W.
ho2bldgamen4 W200011W.
ho2levelsflr W200068W.
ho2homeamen1 W200011W.
ho2homeamen2 W200011W.
ho2homeamen3 W200011W.
ho2bathprivt W200011W.
ho2bathamen1 W200011W.
ho2bathamen2 W200011W.
ho2bathamen3 W200011W.
ho2bathamen4 W200011W.
ho2bathamen5 W200011W.
ho2bathamen6 W200011W.
ho2bathamen7 W200011W.
ho2kitchnprv W200011W.
ho2kitchncom W200011W.
ho2microwave W200011W.
ho2dbldg1 RFDK_YN.
ho2dbldg2 RFDK_YN.
ho2dbldg3 RFDK_YN.
ho2dbldg4 RFDK_YN.
ho2dbathprvt RFDK_YN.
ho2dkitchnpr RFDK_YN.
ho2dkitchnco RFDK_YN.
fl2onefloor W200011W.
fl2bathgrbbr W200011W.
fl2bathseat W200011W.
fl2raisedtlt W200011W.
fl2tltgrbbr W200011W.
em2modhere1 W200069W.
em2addlstyr1 W200011W.
em2addlstyr2 W200011W.
em2addlstyr3 W200011W.
em2addlstyr4 W200011W.
em2addlstyr5 W200011W.
em2addlstyr6 W200011W.
em2addlstyr7 W200011W.
em2payyufam1 W200011W.
em2payyufam2 W200011W.
em2payyufam3 W200011W.
em2payyufam4 W200011W.
em2payyufam5 W200011W.
em2payyufam6 W200011W.
em2payyufam7 W200011W.
em2paydevce1 W200011W.
em2paydevce2 W200011W.
em2paydevce3 W200011W.
em2paydevce4 W200011W.
em2paydevce5 W200011W.
em2paydevce6 W200011W.
em2paydevce7 W200011W.
em2paydevce8 W200011W.
em2paydevce9 W200011W.
em2payaltgth W200070W.
em2morls1000 W200071W.
em2morls100 W200072W.
cm2knowwell W200126W.
cm2willnghlp W200126W.
cm2peoptrstd W200126W.
te2cellphone W200011W.
te2othrphone W200011W.
te2computer W200073W.
te2compoth W200011W.
te2emailtext W200011W.
te2oftnemail W200074W.
te2online W200011W.
te2shoponli1 W200011W.
te2shoponli2 W200011W.
te2shoponli3 W200011W.
te2intrntmd1 W200011W.
te2intrntmd2 W200011W.
te2intrntmd3 W200011W.
md2canewlker W200011W.
md2cane W200011W.
md2walker W200011W.
md2wheelchar W200011W.
md2whelcrspc W200011W.
md2scooter W200011W.
md2scterinsp W200011W.
fl2cane W200011W.
fl2walker W200011W.
fl2wheelchr W200011W.
fl2whlchrhom W200011W.
fl2scooter W200011W.
fl2scooterhm W200011W.
ss2heringaid W200076W.
ss2hearphone W200011W.
ss2convwradi W200011W.
ss2convquiet W200011W.
ss2glasseswr W200077W.
ss2seewellst W200011W.
ss2seestvgls W200011W.
ss2glasscls W200011W.
ss2othvisaid W200011W.
ss2glrednewp W200011W.
ss2probchswl W200011W.
ss2probspeak W200011W.
ss2painbothr W200011W.
ss2painlimts W200011W.
ss2painmedof W200078W.
ss2painwhe1 RFDK_YN.
ss2painwhe2 RFDK_YN.
ss2painwhe3 RFDK_YN.
ss2painwhe4 RFDK_YN.
ss2painwhe5 RFDK_YN.
ss2painwhe6 RFDK_YN.
ss2painwhe7 RFDK_YN.
ss2painwhe8 RFDK_YN.
ss2painwhe9 RFDK_YN.
ss2painwhe10 RFDK_YN.
ss2painwhe11 RFDK_YN.
ss2painwhe12 RFDK_YN.
ss2painwhe13 RFDK_YN.
ss2probbreat W200011W.
ss2prbbrlimt W200011W.
ss2strnglmup W200011W.
ss2uplimtact W200011W.
ss2lwrbodstr W200011W.
ss2lwrbodimp W200011W.
ss2lowenergy W200011W.
ss2loenlmtat W200011W.
ss2prbbalcrd W200011W.
ss2prbbalcnt W200011W.
fl2deaf W200011W.
fl2blind W200011W.
pc2walk6blks W200011W.
pc2walk3blks W200011W.
pc2up20stair W200011W.
pc2up10stair W200011W.
pc2car20pnds W200011W.
pc2car10pnds W200011W.
pc2geonknees W200011W.
pc2bendover W200011W.
pc2hvobovrhd W200011W.
pc2rechovrhd W200011W.
pc2opnjarwhd W200011W.
pc2grspsmobj W200011W.
cp2memrygood W200051W.
cp2knownspyr W200011W.
cp2chgthink1 W200080W.
cp2chgthink2 W200080W.
cp2chgthink3 W200080W.
cp2chgthink4 W200080W.
cp2chgthink5 W200080W.
cp2chgthink6 W200080W.
cp2chgthink7 W200080W.
cp2chgthink8 W200080W.
cp2memcogpr1 W200011W.
cp2memcogpr2 W200011W.
cp2memcogpr3 W200011W.
cp2memcogpr4 W200011W.
cp2dad8dem DAD8DEM.
cg2speaktosp W200011W.
cg2quesremem W200011W.
cg2reascano1 RFDK_YN.
cg2reascano2 RFDK_YN.
cg2reascano3 RFDK_YN.
cg2reascano4 RFDK_YN.
cg2reascano5 RFDK_YN.
cg2reascano6 RFDK_YN.
cg2reascano7 W200081W.
cg2reascano8 W200081W.
cg2reascano9 W200081W.
cg2ratememry W200051W.
cg2ofmemprob W200078W.
cg2memcom1yr W200082W.
cg2todaydat1 W200083W.
cg2todaydat2 W200083W.
cg2todaydat3 W200083W.
cg2todaydat5 W200083W.
cg2todaydat4 W200083W.
cg2todaydat6 W200083W.
cg2prewrdrcl W200084W.
cg2dwrdlstnm WORDREC.
cg2wrdsrcal1 W200085W.
cg2wrdsrcal2 W200085W.
cg2wrdsrcal3 W200085W.
cg2wrdsrcal4 W200085W.
cg2wrdsrcal5 W200085W.
cg2wrdsrcal6 W200085W.
cg2wrdsrcal7 W200085W.
cg2wrdsrcal8 W200085W.
cg2wrdsrcal9 W200085W.
cg2wrdsrca10 W200085W.
cg2dwrdimmrc WORDRE_N.
cg2dwrdinone DWRDINON.
cg2dwrdirref DWRDIRRE.
cg2wrdsntlst W200011W.
cg2numnotlst RFDK_F.
cg2probreca1 RFDK_YN.
cg2probreca2 RFDK_YN.
cg2probreca3 RFDK_YN.
cg2probreca4 RFDK_YN.
cg2probreca5 W200086W.
cg2dclkdraw DCLCKSC.
cg2dclkimgcl DCLCKCL.
cg2atdrwclck W200087W.
cg2presidna1 RFDK_YN.
cg2presidna2 RFDK_YN.
cg2presidna3 RFDK_YN.
cg2presidna4 RFDK_YN.
cg2vpname1 RFDK_YN.
cg2vpname2 RFDK_YN.
cg2vpname3 RFDK_YN.
cg2vpname4 RFDK_YN.
cg2wrdsdcal1 W200085W.
cg2wrdsdcal2 W200085W.
cg2wrdsdcal3 W200085W.
cg2wrdsdcal4 W200085W.
cg2wrdsdcal5 W200085W.
cg2wrdsdcal6 W200085W.
cg2wrdsdcal7 W200085W.
cg2wrdsdcal8 W200085W.
cg2wrdsdcal9 W200085W.
cg2wrdsdca10 W200085W.
cg2dwrddlyrc WORDRE_N.
cg2dwrddnone DWRDINON.
cg2dwrddrref DWRDIRRE.
cg2wrdnotlst W200011W.
cg2numwrdnot RFDK_F.
cg2dwrd1rcl RFDK_YN.
cg2dwrd2rcl RFDK_YN.
cg2dwrd3rcl RFDK_YN.
cg2dwrd4rcl RFDK_YN.
cg2dwrd5rcl RFDK_YN.
cg2dwrd6rcl RFDK_YN.
cg2dwrd7rcl RFDK_YN.
cg2dwrd8rcl RFDK_YN.
cg2dwrd9rcl RFDK_YN.
cg2dwrd10rcl RFDK_YN.
cg2dwrd1dly RFDK_YN.
cg2dwrd2dly RFDK_YN.
cg2dwrd3dly RFDK_YN.
cg2dwrd4dly RFDK_YN.
cg2dwrd5dly RFDK_YN.
cg2dwrd6dly RFDK_YN.
cg2dwrd7dly RFDK_YN.
cg2dwrd8dly RFDK_YN.
cg2dwrd9dly RFDK_YN.
cg2dwrd10dly RFDK_YN.
mo2outoft W200089W.
mo2outcane W200090W.
mo2outwalkr W200090W.
mo2outwlchr W200090W.
mo2outsctr W200090W.
mo2outhlp W200011W.
mo2outslf W200092W.
mo2outdif W200093W.
mo2outyrgo W200094W.
mo2outwout W200011W.
mo2oftgoarea W200078W.
mo2oflvslepr W200078W.
mo2insdcane W200090W.
mo2insdwalkr W200090W.
mo2insdwlchr W200090W.
mo2insdsctr W200090W.
mo2oftholdwl W200090W.
mo2insdhlp W200011W.
mo2insdslf W200092W.
mo2insddif W200093W.
mo2insdyrgo W200094W.
mo2insdwout W200011W.
mo2beddev W200090W.
mo2bedhlp W200011W.
mo2bedslf W200092W.
mo2beddif W200093W.
mo2bedwout W200011W.
mo2doutsfdf DOUTSFDF.
mo2doutdevi DOUTDEVI.
mo2douthelp DOUTHELP.
mo2dinsdsfdf DINSDSFD.
mo2dinsddevi DINSDDEV.
mo2dinsdhelp DINSDHLP.
mo2dbedsfdf DBEDSFDF.
mo2dbeddevi DBEDDEVI.
mo2dbedhelp DBEDHELP.
fl2didntleav W200011W.
fl2ntlvrmslp W200011W.
dm2helpmobil W200011W.
dm2helpstmo W200095W.
dm2helpstyr W200040W.
dm2helpendmo W200095W.
dm2helpendyr W200040W.
dm2nohelp W200096W.
dm2nohelpmos RFDK_F.
dm2lstyrcane W200011W.
dm2devstmo W200095W.
dm2devstyr W200040W.
dm2devendmo W200095W.
dm2devendyr W200040W.
dm2nodev W200096W.
dm2nodevmos RFDK_F.
dmds2dintvl DMDSINTV.
dm2dmohlp DMDS_DUR.
dm2dmodev DMDS_DUR.
dm2dmohlpgr DMH_GRP.
dm2dmodevgr DMU_GRP.
dm2flag DMDSFLG.
dt2driveyr W200097W.
dt2oftedrive W200078W.
dt2avoidriv1 W200098W.
dt2avoidriv2 W200098W.
dt2avoidriv3 W200098W.
dt2avoidriv4 W200098W.
dt2getoplcs1 W200011W.
dt2getoplcs2 W200011W.
dt2getoplcs3 W200011W.
dt2getoplcs4 W200011W.
dt2getoplcs5 W200011W.
dt2getoplcs6 W200011W.
dt2getoplcs7 W200011W.
dt2otfrfamtk W200011W.
fl1dneverdrv RFDK_Y.
fl2drives W200011W.
fl2drvlstyr W200011W.
ha2laun W200099W.
ha2launslf W200011W.
ha2whrmachi1 RFDK_YN.
ha2whrmachi2 RFDK_YN.
ha2whrmachi3 RFDK_YN.
ha2whrmachi4 RFDK_YN.
ha2whrmachi5 RFDK_YN.
ha2whrmachi6 RFDK_YN.
ha2dlaunreas DLAUNREA.
ha2laundif W200093W.
ha2launoft W200102W.
ha2launwout W200011W.
ha2shop W200099W.
ha2shopslf W200011W.
ha2howpaygr1 RFDK_YN.
ha2howpaygr2 RFDK_YN.
ha2howpaygr3 RFDK_YN.
ha2howpaygr4 RFDK_YN.
ha2howpaygr5 RFDK_YN.
ha2howpaygr6 RFDK_YN.
ha2howpaygr7 RFDK_YN.
ha2howgtstr1 RFDK_YN.
ha2howgtstr2 RFDK_YN.
ha2howgtstr3 RFDK_YN.
ha2howgtstr4 RFDK_YN.
ha2howgtstr5 RFDK_YN.
ha2howgtstr6 RFDK_YN.
ha2howgtstr7 RFDK_YN.
ha2howgtstr8 RFDK_YN.
ha2shopcart W200011W.
ha2shoplean W200011W.
ha2dshopreas DSHOPREA.
ha2shopdif W200093W.
ha2shopoft W200102W.
ha2shopwout W200011W.
ha2meal W200099W.
ha2mealslf W200011W.
ha2restamels W200090W.
ha2oftmicrow W200090W.
ha2dmealreas DMEALREA.
ha2mealdif W200093W.
ha2mealoft W200102W.
ha2mealwout W200011W.
ha2bank W200099W.
ha2bankslf W200011W.
ha2dbankreas DBANKREA.
ha2bankdif W200093W.
ha2bankoft W200102W.
ha2bankwout W200011W.
ha2money W200011W.
ha2moneyhlp W200011W.
ha2dlaunsfdf DLAUNSFD.
ha2dshopsfdf DSHOPSFD.
ha2dmealsfdf DMEALSFD.
ha2dbanksfdf DBANKSFD.
ha2dmealwhl RFDK_Y.
ha2dmealtkot RFDK_Y.
sc2eatdev W200106W.
sc2eatdevoft W200107W.
sc2eathlp W200011W.
sc2eatslfoft W200092W.
sc2eatslfdif W200093W.
sc2eatwout W200011W.
sc2showrbat1 RFDK_YN.
sc2showrbat2 RFDK_YN.
sc2showrbat3 RFDK_YN.
sc2bdevdec W200011W.
sc2prfrshbth W200109W.
sc2scusgrbrs W200090W.
sc2shtubseat W200090W.
sc2bathhlp W200011W.
sc2bathoft W200092W.
sc2bathdif W200093W.
sc2bathyrgo W200102W.
sc2bathwout W200011W.
sc2usvartoi1 W200011W.
sc2usvartoi2 W200011W.
sc2usvartoi3 W200011W.
sc2usvartoi4 W200011W.
sc2toilhlp W200011W.
sc2toiloft W200092W.
sc2toildif W200093W.
sc2toilwout W200011W.
sc2dresoft W200078W.
sc2dresdev W200011W.
sc2dreshlp W200011W.
sc2dresslf W200092W.
sc2dresdif W200093W.
sc2dresyrgo W200102W.
sc2dreswout W200011W.
sc2deatdevi DEATDEVI.
sc2deathelp DEATHELP.
sc2deatsfdf DEATSFDF.
sc2dbathdevi DBATHDEV.
sc2dbathhelp DBATHHEL.
sc2dbathsfdf DBATHSFD.
sc2dtoildevi DTOILDEV.
sc2dtoilhelp DTOILHEL.
sc2dtoilsfdf DTOILSFD.
sc2ddresdevi DDRESDEV.
sc2ddreshelp DDRESHEL.
sc2ddressfdf DDRESSFD.
fl2showering W200011W.
fl2takingbth W200011W.
fl2washingup W200011W.
ds2gethlpeat W200011W.
ds2helpstmo W200095W.
ds2helpstyr W200040W.
ds2helpendmo W200095W.
ds2helpendyr W200040W.
ds2nohelp W200096W.
ds2nohelpmos RFDK_F.
ds2dschlp DMDS_DUR.
ds2dschlpgr DS_GRP.
ds2flag DMDSFLG.
mc2meds W200011W.
mc2medstrk W200099W.
mc2medsslf W200011W.
mc2whrgtmed1 RFDK_YN.
mc2whrgtmed2 RFDK_YN.
mc2whrgtmed3 RFDK_YN.
mc2whrgtmed4 RFDK_YN.
mc2howpkupm1 RFDK_YN.
mc2howpkupm2 RFDK_YN.
mc2howpkupm3 RFDK_YN.
mc2medsrem W200090W.
mc2dmedsreas DMEDSREA.
mc2medsdif W200093W.
mc2medsyrgo W200102W.
mc2medsmis W200011W.
mc2havregdoc W200011W.
mc2regdoclyr W200011W.
mc2hwgtregd1 RFDK_YN.
mc2hwgtregd2 RFDK_YN.
mc2hwgtregd3 RFDK_YN.
mc2hwgtregd4 RFDK_YN.
mc2hwgtregd5 RFDK_YN.
mc2hwgtregd6 RFDK_YN.
mc2hwgtregd7 RFDK_YN.
mc2hwgtregd8 RFDK_YN.
mc2hwgtregd9 RFDK_YN.
mc2ansitindr W200011W.
mc2tpersevr1 W200011W.
mc2tpersevr2 W200011W.
mc2tpersevr3 W200011W.
mc2tpersevr4 W200011W.
mc2chginspln W200011W.
mc2anhlpwdec W200011W.
mc2dmedssfdf DMEDSSFD.
pa2vistfrfam W200011W.
pa2hlkepfvst W200011W.
pa2trkpfrvis W200011W.
pa2impvstfam W200114W.
pa2attrelser W200011W.
pa2htkfrrlsr W200011W.
pa2trprrelsr W200011W.
pa2imprelser W200114W.
pa2clbmtgrac W200011W.
pa2hlkpfrclb W200011W.
pa2trprkpfgr W200011W.
pa2imparclub W200114W.
pa2outfrenjy W200011W.
pa2hlkpgoenj W200011W.
pa2trprgoout W200011W.
pa2impouteny W200114W.
pa2workfrpay W200011W.
pa2hlkpfrwrk W200011W.
pa2voltrwork W200011W.
pa2hlkpfrvol W200011W.
pa2prcranoth W200011W.
pa2evrgowalk W200011W.
pa2vigoractv W200011W.
pa2dofavact W200115W.
pa2helmfvact W200115W.
pa1dv2favact PA25FMT.
sd2smokesnow W200011W.
sd2numcigday NUMCIGS.
pe2whhndsign W200116W.
pe2surghdwrt W200011W.
pe2surgyside W200117W.
pe2flruppain W200011W.
pe2sideflrup W200117W.
pe2surgarmsh W200011W.
pe2sidsurgar W200117W.
pe2surgyhips W200011W.
pe2sidhipsrg W200118W.
pe2stndwhold W200011W.
pe2upchbyslf W200011W.
pe2wlkdsself W200011W.
fl2lefthand W200011W.
fl2righthand W200011W.
fl2eiherhand W200011W.
fl2lftgrptst W200011W.
fl2rhtgrptst W200011W.
fl2charstnds W200011W.
fl2balstands W200011W.
fl2wlkingrse W200011W.
ba2dblssadm BA1SS.
ba2dblstadm BA1STAN.
ba2dblftadm BA1TAN.
ba2dblopadm BA1OP.
ba2dblcladm BA1CL.
wa2dwlkadm WA1WLK.
ch2dschradm CH1SCH.
ch2drchradm CH1RSH.
gr2dgripadm GR1GRIP.
wc2dwaistadm WC1WAIST.
pk2dpeakadm PK1PEAK.
ab2datemonth W200038W.
ab2dateyear RFDK_F.
in2strtabhrs RFDK_F.
in2strtabmin RFDK_F.
in2strtmampm A0001AB.
ba2sxsresult PE_RSLT.
ba2blstdsecs RFDK_F.
ba2blstdhndr RFDK_F.
ba2rsn1ssstd RFDK_YN.
ba2rsn2ssstd RFDK_YN.
ba2rsn3ssstd RFDK_YN.
ba2rsn4ssstd RFDK_YN.
ba2rsn9ssstd RFDK_YN.
ba2stdmreslt PE_RSLT.
ba2stdmsecs RFDK_F.
ba2stdmhndr RFDK_F.
ba2rsn1ststd RFDK_YN.
ba2rsn2ststd RFDK_YN.
ba2rsn3ststd RFDK_YN.
ba2rsn4ststd RFDK_YN.
ba2rsn9ststd RFDK_YN.
ba2ftdmreslt PE_RSLT.
ba2ftdmsecs RFDK_F.
ba2ftdmhndr RFDK_F.
ba2rsn1ftstd RFDK_YN.
ba2rsn2ftstd RFDK_YN.
ba2rsn3ftstd RFDK_YN.
ba2rsn4ftstd RFDK_YN.
ba2rsn9ftstd RFDK_YN.
ba21leoreslt PE_RSLT.
ba21leosfsec RFDK_F.
ba21leohndr RFDK_F.
ba2rsn11leo RFDK_YN.
ba2rsn21leo RFDK_YN.
ba2rsn31leo RFDK_YN.
ba2rsn41leo RFDK_YN.
ba2rsn91leo RFDK_YN.
ba21lecreslt PE_RSLT.
ba21lecsfsec RFDK_F.
ba21lechndr RFDK_F.
ba2rsn11lec RFDK_YN.
ba2rsn21lec RFDK_YN.
ba2rsn31lec RFDK_YN.
ba2rsn41lec RFDK_YN.
ba2rsn91lec RFDK_YN.
wa2wlkcorspc A0002WA.
wa2wkaidused A0004WA.
wa2wlkc1rslt PE_RSLT.
wa2wlkc1secs RFDK_F.
wa2wlk1hndr RFDK_F.
wa2rsn11wkc RFDK_YN.
wa2rsn21wkc RFDK_YN.
wa2rsn31wkc RFDK_YN.
wa2rsn41wkc RFDK_YN.
wa2rsn51wkc RFDK_YN.
wa2rsn91wkc RFDK_YN.
wa2wkaidusc2 A0004WA.
wa2wlkc2rslt PE_RSLT.
wa2wlkc2secs RFDK_F.
wa2wlk2hndr RFDK_F.
wa2rsn12wkc RFDK_YN.
wa2rsn22wkc RFDK_YN.
wa2rsn32wkc RFDK_YN.
wa2rsn42wkc RFDK_YN.
wa2rsn92wkc RFDK_YN.
ch2chravail RFDK_YN.
ch2chstcompl A0004CH.
ch2chairheit RFDK_F.
ch2whlchrusd RFDK_YN.
ch2sgchstres PE_RSLT.
ch2armuse A0008CH.
ch2rsn11chs RFDK_YN.
ch2rsn21chs RFDK_YN.
ch2rsn31chs RFDK_YN.
ch2rsn41chs RFDK_YN.
ch2rsn51chs RFDK_YN.
ch2rsn91chs RFDK_YN.
ch22chstrslt PE_RSLT.
ch2chstndsec RFDK_F.
ch2chstdhndr RFDK_F.
ch2chstddone A0014CH.
ch2chstntdn1 RFDK_YN.
ch2chstntdn2 RFDK_YN.
ch2chstntdn3 RFDK_YN.
ch2chstntdn4 RFDK_YN.
ch2chstntdn5 RFDK_YN.
ch2chstntdn9 RFDK_YN.
ch2chstntat1 RFDK_YN.
ch2chstntat2 RFDK_YN.
ch2chstntat3 RFDK_YN.
ch2chstntat4 RFDK_YN.
ch2chstntat9 RFDK_YN.
gr2handtstd1 RGT_LFT.
gr2adjgr1ps3 RFDK_YN.
gr2grp1reslt PE_RSLT.
gr2grp1rdng RFDK_F.
gr2grp1noat1 RFDK_YN.
gr2grp1noat2 RFDK_YN.
gr2grp1noat3 RFDK_YN.
gr2grp1noat4 RFDK_YN.
gr2grp1noat9 RFDK_YN.
gr2handtstd2 RGT_LFT.
gr2adjgr2ps3 RFDK_YN.
gr2grp2reslt PE_RSLT.
gr2grp2rdng RFDK_F.
gr2grp2noat1 RFDK_YN.
gr2grp2noat2 RFDK_YN.
gr2grp2noat3 RFDK_YN.
gr2grp2noat4 RFDK_YN.
gr2grp2noat9 RFDK_YN.
wc2measdiff1 RFDK_YN.
wc2measdiff2 RFDK_YN.
wc2measdiff3 RFDK_YN.
wc2measdiff4 RFDK_YN.
wc2measdiff5 RFDK_YN.
wc2measdiff6 RFDK_YN.
wc2measdiff9 RFDK_YN.
wc2waistrslt PE_RSLT.
wc2wstmsrinc RFDK_F.
wc2wstmsrqrt RFDK_F.
wc2wstbulkcl RFDK_Y.
wc2whomeasur PERSON.
wc2wstpostn STAND.
wc2wstnotat1 RFDK_YN.
wc2wstnotat2 RFDK_YN.
wc2wstnotat3 RFDK_YN.
wc2wstnotat4 RFDK_YN.
wc2wstnotat5 RFDK_YN.
wc2wstnotat9 RFDK_YN.
pk2pkarf1pos STAND.
pk2pkarfl1ef EFFORT.
pk2pkarfl1rs PE_RSLT.
pk2pkarfl1rd RFDK_F.
pk2pk1noatt1 RFDK_YN.
pk2pk1noatt2 RFDK_YN.
pk2pk1noatt3 RFDK_YN.
pk2pk1noatt4 RFDK_YN.
pk2pk1noatt9 RFDK_YN.
pk2paf2posit STAND.
pk2pkarfl2ef EFFORT.
pk2pkarfl2rs PE_RSLT.
pk2pkarfl2rd RFDK_F.
pk2pk2noatt1 RFDK_YN.
pk2pk2noatt2 RFDK_YN.
pk2pk2noatt3 RFDK_YN.
pk2pk2noatt4 RFDK_YN.
pk2pk2noatt9 RFDK_YN.
cl2endtimhrs RFDK_F.
cl2endtimmin RFDK_F.
cl2endtmampm A0001AB.
R2DNHATSSPPB SPPB.
R2DNHATSBASC QUARTILE.
R2DNHATSWKSC QUARTILE.
R2DNHATSCHSC QUARTILE.
R2DNHATSGRAV QUARTILE.
R2DNHATSGRB QUARTILE.
R2DNHATSPKAV QUARTILE.
R2DNHATSPKB QUARTILE.
R2DSPPBMISS SPPB_MIS.
R2DORIGSPPB RFDK_F.
r2dorigbasc RFDK_F.
r2dorigwksc RFDK_F.
r2dorigchsc RFDK_F.
hw2currweigh RFDK_F.
hw2lst10pnds W200011W.
hw2trytolose W200011W.
hw2howtallft RFDK_F.
hw2howtallin RFDK_F.
el2mothalive W200011W.
el2fathalive W200011W.
wb2offelche1 W200078W.
wb2offelche2 W200078W.
wb2offelche3 W200078W.
wb2offelche4 W200078W.
wb2truestme1 W200127W.
wb2truestme2 W200127W.
wb2truestme3 W200127W.
wb2truestme4 W200127W.
wb2ageyofeel RFDK_F.
wb2agrwstmt1 W200127W.
wb2agrwstmt2 W200127W.
wb2agrwstmt3 W200127W.
ip2covmedcad W200011W.
ip2otdrugcov W200011W.
ip2mgapmedsp W200011W.
ip2cmedicaid W200011W.
ip2covtricar W200011W.
ip2nginslast W200096W.
ip2nginsnurs W200011W.
ip2typcarco1 RFDK_YN.
ip2typcarco2 RFDK_YN.
ip2typcarco3 RFDK_YN.
ip2paypremms W200129W.
lf2workfpay W200131W.
lf2abstlstwk W200131W.
lf2wrkplstmn W200011W.
lf2mrthnonjb W200011W.
lf2hrswkwork RFDK_F.
lf2hrwrkltwk RFDK_F.
lf2hrwrklstw RFDK_F.
lf2oftpaid W200132W.
lf2huswifwrk W200011W.
lf2doccup OCC_CODE.
hp2ownrentot W200133W.
hp2mrtpadoff W200134W.
hp2mthlymort RFDK_F.
hp2mortpaymt W200135W.
hp2whnpayoff W200136W.
hp2amtstlowe RFDK_F.
hp2amoutowed W200137W.
hp2homevalue RFDK_F.
hp2homvalamt W200138W.
hp2payrent W200011W.
hp2rentamt RFDK_F.
hp2rentamout W200135W.
hp2sec8pubsn W200011W.
ew2pycredbal W200139W.
ew2crecardeb W200140W.
ew2credcdmed W200011W.
ew2amtcrdmed W200141W.
ew2medpaovtm W200011W.
ew2ampadovrt W200142W.
ew2finhlpfam W200011W.
ew2whohelfi1 RFDK_YN.
ew2whohelfi2 RFDK_YN.
ew2atchhelyr W200142W.
ew2fingftfam W200011W.
ew2whregoth1 RFDK_YN.
ew2whregoth2 RFDK_YN.
ew2whregoth3 RFDK_YN.
ew2amthlpgiv W200142W.
ew2progneed1 W200011W.
ew2progneed2 W200011W.
ew2progneed3 W200011W.
ew2mealskip1 W200011W.
ew2mealskip2 W200146W.
ew2nopayhous W200011W.
ew2nopayutil W200011W.
ew2nopaymed W200011W.
ad2heardif W200011W.
ad2seedif W200011W.
ad2concdif W200011W.
ad2walkdif W200011W.
ad2dresdif W200011W.
ad2erranddif W200011W.
eh2advicedoc W200122W.
eh2advicefam W200122W.
eh2medmgmt W200123W.
eh2meddif W200124W.
eh2medfamdif W200124W.
eh2meddelay W200124W.
eh2medtoomch W200124W.
ep2eoltalk W200011W.
ep2eoltalk2 RFDK_YN.
ep2eoltalk3 RFDK_YN.
ep2eoltalk4 RFDK_YN.
ep2eoltalk5 RFDK_YN.
ep2eoltalk6 RFDK_YN.
ep2eoltalk7 RFDK_YN.
ep2eoltalk8 RFDK_YN.
ep2eoltalk9 RFDK_YN.
ep2eoltalk10 RFDK_YN.
ep2eoltalk11 RFDK_YN.
ep2eoltalk12 RFDK_YN.
ep2eoltalk13 RFDK_YN.
ep2eoltalk14 RFDK_YN.
ep2eoltalk15 RFDK_YN.
ep2eoltalk16 RFDK_YN.
ep2eoltalk17 RFDK_YN.
ep2eoltalk18 RFDK_YN.
ep2eoltalk19 RFDK_YN.
ep2eoltalk20 RFDK_YN.
ep2eoltalk21 RFDK_YN.
ep2eoltalk22 RFDK_YN.
ep2eoltalk23 RFDK_YN.
ep2eoltalk24 RFDK_YN.
ep2eoltalk25 RFDK_YN.
ep2eoltalk26 RFDK_YN.
ep2eoltalk27 RFDK_YN.
ep2eoltalk28 RFDK_YN.
ep2eoltalk29 RFDK_YN.
ep2eoltalk30 RFDK_YN.
ep2eoltalk31 RFDK_YN.
ep2eoltalk32 RFDK_YN.
ep2eoltalk33 RFDK_YN.
ep2eoltalk34 RFDK_YN.
ep2eoltalk35 RFDK_YN.
ep2eoltalk36 RFDK_YN.
ep2eoltalk37 RFDK_YN.
ep2eoltalk38 RFDK_YN.
ep2eoltalk39 RFDK_YN.
ep2eoltalk40 RFDK_YN.
ep2eoltalk91 RFDK_YN.
ep2eoltalk92 RFDK_YN.
ep2poweratty W200011W.
ep2eolpow2 RFDK_YN.
ep2eolpow3 RFDK_YN.
ep2eolpow4 RFDK_YN.
ep2eolpow5 RFDK_YN.
ep2eolpow6 RFDK_YN.
ep2eolpow7 RFDK_YN.
ep2eolpow8 RFDK_YN.
ep2eolpow9 RFDK_YN.
ep2eolpow10 RFDK_YN.
ep2eolpow11 RFDK_YN.
ep2eolpow12 RFDK_YN.
ep2eolpow13 RFDK_YN.
ep2eolpow14 RFDK_YN.
ep2eolpow15 RFDK_YN.
ep2eolpow16 RFDK_YN.
ep2eolpow17 RFDK_YN.
ep2eolpow18 RFDK_YN.
ep2eolpow19 RFDK_YN.
ep2eolpow20 RFDK_YN.
ep2eolpow21 RFDK_YN.
ep2eolpow22 RFDK_YN.
ep2eolpow23 RFDK_YN.
ep2eolpow24 RFDK_YN.
ep2eolpow25 RFDK_YN.
ep2eolpow26 RFDK_YN.
ep2eolpow27 RFDK_YN.
ep2eolpow28 RFDK_YN.
ep2eolpow29 RFDK_YN.
ep2eolpow30 RFDK_YN.
ep2eolpow31 RFDK_YN.
ep2eolpow32 RFDK_YN.
ep2eolpow33 RFDK_YN.
ep2eolpow34 RFDK_YN.
ep2eolpow35 RFDK_YN.
ep2eolpow36 RFDK_YN.
ep2eolpow37 RFDK_YN.
ep2eolpow38 RFDK_YN.
ep2eolpow39 RFDK_YN.
ep2eolpow40 RFDK_YN.
ep2eolpow91 RFDK_YN.
ep2eolpow92 RFDK_YN.
ep2livngwill W200011W.
ep2paintrmnt W200119W.
ep2talktrmnt W200119W.
ep2bstcre W200120W.
ep2sndbstcre W200120W.
ep2money W200121W.
ir2intlang I200003W.
ir2spattitud I200005W.
ir2undrstand I200006W.
ir2sppresent I200008W.
ir2spnotprs1 RFDK_YN.
ir2spnotprs2 RFDK_YN.
ir2spnotprs3 RFDK_YN.
ir2spnotprs4 RFDK_YN.
ir2spnotprs5 RFDK_YN.
ir2spnotprs6 RFDK_YN.
ir2intvwhlp I200010W.
ir2prsnhlp1 RFDK_YN.
ir2prsnhlp2 RFDK_YN.
ir2prsnhlp3 RFDK_YN.
ir2prsnhlp4 RFDK_YN.
ir2prsnhlp5 RFDK_YN.
ir2prsnhlp6 RFDK_YN.
ir2prsnhlp91 RFDK_YN.
ir2demolang1 I200013W.
ir2strprob I200012W.
ir2sessions I200002W.
ir2sessrsn1 RFDK_YN.
ir2sessrsn2 RFDK_YN.
ir2sessrsn3 RFDK_YN.
ir2sessrsn91 RFDK_YN.
ir2conhomapt I200016W.
ir2insidhome I200002W.
ir2condihom1 I200002W.
ir2condihom2 I200002W.
ir2condihom3 I200002W.
ir2condihom4 I200002W.
ir2condihom5 I200002W.
ir2clutterr1 I200017W.
ir2clutterr2 I200017W.
ir2areacond1 I200018W.
ir2areacond2 I200018W.
ir2areacond3 I200018W.
ir2condhome1 I200019W.
ir2condhome2 I200019W.
ir2condhome3 I200019W.
ir2condhome4 I200019W.
ir2condhome5 I200019W.
ir2condhome6 I200019W.
r2stroopmean DSTRP_M.
r2strooprati DSTRP_R.
r2stroopgrp DSTRP_G.
fq2dfacdescr F200006W.
fq2dosfacd DOSFACD.
fq2prtlivnam F200007W.
fq2dfacarea F200008W.
fq2dosfaca DOSFACA.
fq2assdnrsng F200009W.
fq2othrlevls F200007W.
fq2whotlevl1 RFDK_YN.
fq2whotlevl2 RFDK_YN.
fq2whotlevl3 RFDK_YN.
fq2whotlevl4 RFDK_YN.
fq2whotlevl5 RFDK_YN.
fq2servaval1 F200011W.
fq2servaval2 F200011W.
fq2servaval3 F200011W.
fq2servaval4 F200011W.
fq2servaval5 F200011W.
fq2servaval6 F200011W.
fq2servaval7 F200011W.
fq2servaval8 F200011W.
fq2servaval9 F200011W.
fq2paysourc1 RFDK_F.
fq2paysourc2 RFDK_F.
fq2paysourc3 RFDK_F.
fq2paysourc4 RFDK_F.
fq2paysourc5 RFDK_F.
fq2paysourc6 RFDK_F.
fq2totalpaym F200007W.
fq2mnthlyamt RFDK_F.
fq2primpayer F200012W.
fq2govsource F200007W.
fq2dlocsp D_LOCSP. ;

/* Section #4 - Label assignment statement   */
label
 spid="NHATS SAMPLED PERSON ID"
r2dlmlint="R2 D LAST MTH LIFE INTVW DONE"
r2dresid="R2 D RESIDENTIAL CARE STATUS"
r1dresid="R1 D RESIDENTIAL CARE STATUS"
r2dresidlml="R2 D LAST MTH LIFE RESIDNCE"
r2breakoffst="R2 CASE BREAKOFF STATUS"
r2breakoffqt="R2 CASE BREAKOFF QUESTION"
is2resptype="R2 IS2 TYPE OF RESPONDENT"
is2reasnprx1="R2 IS2A PROXY REAS SP DEMENTIA"
is2reasnprx2="R2 IS2A PROXY REAS SP ILL"
is2reasnprx3="R2 IS2A PRXY REAS SP SPCH IMPAIR"
is2reasnprx4="R2 IS2A PRXY REAS SP HEAR IMPAIR"
is2reasnprx5="R2 IS2A PROXY REAS LANG BARRIER"
is2reasnprx6="R2 IS2A PROXY REAS TEMP UNAVAIL"
is2reasnprx7="R2 IS2A PROXY REAS DECEASED"
is2reasnprx9="R2 IS2A PROXY REAS OTHER"
is2tempres="R2 IS2B2 TEMPORARY RESIDENCE"
is2prxyrelat="R2 IS9 PROXY RELATIONSHIP TO SP"
is2prxygendr="R2 IS10 PROXY GENDER"
is2famrrutin="R2 IS11 FAMILRTY SP DAILY ROUTIN"
is2proxlivsp="R2 IS11A PROXY LIVES W SP"
r2d2intvrage="R2 D SP CAT AGE AT INTVW"
is2dproxyid="R2 D PROXY OPID"
re2spadrsnew="R2 RE4F SP ADDRESS SAME OR DIFF"
re2intplace="R2 RE7 SP INT AT PLACE OF RES"
re2newstrct="R2 RE8 NEW RESID PHYS STRUC IN R2"
re2newblgfl="R2 RE9 NEW RESID BLDG FLOORS IN R2 "
re2mthmove="R2 RE10 MONTH MOVED NEW ADDRESS "
re2yearmove="R2 RE10B YEAR MOVED NEW ADDRESS "
re2placedec="R2 RE11 CARE AT PLACE SP DIED"
re2alonedec="R2 RE12 LIVED ALONE AT DEATH"
re2dadrscorr="R2 D RE4F ADDRESS SAME DIFF CORRECTED"
re2dresistrct="R2 D RESIDNCE PHYSICAL STRCTUR"
re2dbldg="R2 D SP BLDG MORE THAN ONE FLOOR"
re2dcensdiv="R2 D SP CENSUS DIVISION"
fl2structure="R2 F RE STRUCTURE OF SP DWELLING"
fl2bldgfl="R2 F RE SP BLDG MORE THAN ONE FLOOR"
fl2resnew="R2 F RE NEW ADDRESS FROM PRIOR ROUND"
fl2facility="R2 F RE ROUTING FLAG FROM RE4f HT3 5 6 7"
fl2hotype="R2 F RE HT TYPE OF HOME"
fl2retirecom="R2 F RE HT SP LIVES IN RETIREMT COM"
pd2placedied="R2 PD3 PLACE OF DEATH"
pd2homedied="R2 PD3B SP OR OTHER HOME DIED"
pd2hospdied="R2 PD3C HOSPITAL UNIT DIED"
pd2hospice1="R2 PD3D HOSPICE AT NURSING HOME"
pd2hospice2="R2 PD3E HOSPICE OTHER PLACE"
pd2stayunit="R2 PD4 LENGTH OF STAY UNIT"
pd2staydays="R2 PD4A LENGTH OF STAY DAYS"
pd2staywks="R2 PD4B LENGTH OF STAY WEEKS"
pd2staymths="R2 PD4C LENGTH OF STAY MONTHS"
pd2stayyrs="R2 PD4D LENGTH OF STAY YEARS"
pd2staymthpl="R2 PD4E LENGTH OF STAY MTH PLUS"
pd2placepre="R2 PD5 PLACE PRE HOSP HOSPICE NH"
pd2alert="R2 PD6 ALERT IN LAST MONTH"
pd2outbed="R2 PD7 GET OUT OF BED IN LST MTH"
r2d2deathage ="R2 D SP CAT AGE AT DEATH"
fl2spdied="R2 F SP DIED PRIOR TO R2  "
fl2notalert="R2 F LML NOT ALERT"
fl2notmobile="R2 F LML NOT MOBILE"
lm2pain="R2 LM1 PAIN IN LAST MONTH"
lm2painhlp="R2 LM1A GET HELP WITH PAIN"
lm2painhlpam="R2 LM1B PAIN HELP AMOUNT"
lm2bre="R2 LM2 BREATHING TROUBLE"
lm2brehlp="R2 LM2A GET HELP WITH BREATHING"
lm2brehlpam="R2 LM2B BREATHING HELP AMOUNT"
lm2sad="R2 LM3 ANXIOUS OR SAD LAST MONTH"
lm2sadhlp="R2 LM3A ANXIOUS SAD GET HELP FOR"
lm2sadhlpam="R2 LM3B ANXIOUS SAD HELP AMOUNT"
lm2caredecis="R2 LM4 DEC ABOUT CARE WO INPUT"
lm2carenowan="R2 LM5 DEC ABOUT CARE NOT WANTED"
lm2perscare="R2 LM6 PERSONAL CARE NEEDS MET"
lm2respect="R2 LM7 TREATED WITH RESPECT"
lm2informed="R2 LM8 INFORMED ABOUT CONDITION"
lm2doctor="R2 LM9 MORE THAN ONE DOCTOR"
lm2docclear="R2 LM9A CLEAR DOCTOR IN CHARGE"
lm2relg="R2 LM10 TALK RELIGIOUS BELIEFS"
lm2relgamt="R2 LM10A RELIGIOUS BLIEF CONTACT"
lm2ratecare="R2 LM11 HOW RATE CARE"
hc2health="R2 HC1 OVERALL HEALTH CONDITION"
hc2disescn1="R2 HC2 SP HAD HEART ATTACK"
hc2disescn2="R2 HC2 SP HAS HEART DISEASE"
hc2disescn3="R2 HC2 SP HAS HIGH BLOOD PRESS"
hc2disescn4="R2 HC2 SP HAS ARTHRITIS"
hc2disescn5="R2 HC2 SP HAS OSTEOPOROSIS"
hc2disescn6="R2 HC2 SP HAS DIABETES"
hc2disescn7="R2 HC2 SP HAS LUNG DISEASE"
hc2disescn8="R2 HC2 SP HAD STROKE"
hc2disescn9="R2 HC2 SP HAS DEMENTIA OR ALZH"
hc2disescn10="R2 HC2 SP HAS CANCER"
hc2brokebon1="R2 HC5A SP BROKEN OR FRACT HIP"
hc2brokebon2="R2 HC5B SP OTHR BRKN FRACT BONE"
hc2hosptstay="R2 HC7 SP HOSP STAY LAST 12MOS "
hc2hosovrnht="R2 HC8 SP NUM OF HOSP STAYS"
hc2knesrgyr="R2 HC9B KNEE SURGERY IN 12 MNTHS"
hc2hipsrgyr="R2 HC10B HIP SURG IN 12 MNTHS"
hc2catrsrgyr="R2 HC11B CATER SURG IN 12 MNTHS"
hc2backsrgyr="R2 HC12B BCK SPNE SURGR 12 MNTHS"
hc2hartsrgyr="R2 HC13B HEART SURGERY 12 MONTHS"
hc2fllsinmth="R2 HC14 FALL DOWN IN LAST MONTH"
hc2worryfall="R2 HC15 WORRIED ABOT FALLNG DOWN"
hc2worrylimt="R2 HC16 WORRY EVR LIMT ACTIVTIES"
hc2faleninyr="R2 HC17 FALLEN DOWN IN 12 MONTHS"
hc2multifall="R2 HC18 FALLEN DWN MORE THN ONCE"
hc2depresan1="R2 HC19A SP LITTLE INTERST PLEAS"
hc2depresan2="R2 HC19B SP DOWN DEPRES HOPELESS"
hc2depresan3="R2 HC19C SP NERVOUS ANXIOUS"
hc2depresan4="R2 HC19D SP UNABLE TO STOP WORRY"
hc2aslep30mn="R2 HC20 OVER 30 MIN FALL ASLEEP"
hc2trbfalbck="R2 HC21 TROBLE FALLNG BCK ASLEEP"
hc2sleepmed="R2 HC22 OFTN MEDICATE HELP SLEEP"
ht2placedesc="R2 HT3 PLACE BEST DESCRIPTION"
ht2retiresen="R2 HT4 RETIRMNT CMMTY SEN HOUSIN"
ht2diffareun="R2 HT5 DIFF AREAS UNITS TO MOVE"
ht2helpmedbd="R2 HT6 HELP W MEDS BATH DRESSING"
ht2meals="R2 HT7 MEALS FOR RESIDENTS"
ht2spacename="R2 HT10 NAME OF LIVING SPACE"
se2servcoff1="R2 SE1 FAC SERVICES MEALS"
se2servcoff2="R2 SE1 FAC SERVICES HELP W RX"
se2servcoff3="R2 SE1 FAC SERV HELP BATH DRESS"
se2servcoff4="R2 SE1 FAC SERVICES LAUNDRY"
se2servcoff5="R2 SE1 FAC SERVICES HOUSEKEEP"
se2servcoff6="R2 SE1 FAC SERV VAN TO DOCTOR"
se2servcoff7="R2 SE1 FAC SRV VAN TO STORE EVNT"
se2servcoff8="R2 SE1 FAC SERV RECREATIONAL FAC"
se2servcoff9="R2 SE1 FAC SERV SOCIAL EVENTS"
se2servused1="R2 SE2 SERVS USED MEALS"
se2servused2="R2 SE2 SERVS USED HELP W RX"
se2servused3="R2 SE2 SERVS USED HLP BATH DRESS"
se2servused4="R2 SE2 SERVS USED LAUNDRY"
se2servused5="R2 SE2 SERVS USED HOUSEKEEPING"
se2servused6="R2 SE2 SERVS USED VAN TO DOCTOR"
se2servused7="R2 SE2 SERVS USED VAN TO STORE"
se2servused8="R2 SE2 SERVS USED RECREATION FAC"
se2servused9="R2 SE2 SERVS USED SOCIAL EVENTS"
se2payservi1="R2 SE3 PAYMENT FOR SERV MEALS"
se2payservi2="R2 SE3 PAYMENT FOR SERV HLP W RX"
se2payservi3="R2 SE3 PAY FR SERV HLP BATH DRSS"
se2payservi4="R2 SE3 PAYMENT FOR SERV LAUNDRY"
se2payservi5="R2 SE3 PAYMNT FOR SERV HOUSEKEEP"
se2payservi6="R2 SE3 PAYMNT FR SERV VAN TO DOC"
se2payservi7="R2 SE3 PAY FOR SERV VAN TO STORE"
se2payservi8="R2 SE3 PAY FOR SERV RECREATION"
se2payservi9="R2 SE3 PAY FOR SERV SOCIAL EVNTS"
hh2marchange="R2 HH1A MARITAL STATUS CHANGE"
hh2martlstat="R2 HH1 MARITAL STATUS IF CHANGED"
hh2yrendmarr="R2 HH2B YR MARR END OR SPS PASS"
hh2newspoprt="R2 HH4A1 SPOUSE PRTNR SAME OR DIFF"
hh2spgender="R2 HH5 NEW R2 SPOU PART GENDER"
hh2dspouage="R2 D NEW R2 SPOU PART CAT AGE"
hh2dspageall="R2 D SPOU PAR AGE UPDATE AND NEW"
hh2spouseduc="R2 HH9 NEW R2 SPOU PART HIGH EDUC"
hh2spoupchlp="R2 HH10 SPOUS NEED PERS CARE HLP"
hh2livwthspo="R2 HH11 LIVE WITH SPOUSE PARTNER"
hh2placekind="R2 HH12 KIND OF PLACE LIVE IN"
hh2dmarstat="R2 D MARITAL STATUS AT R2"
hh2dlvngarrg="R2 D LIVING ARRANGEMENT"
hh2dhshldnum="R2 D TOTAL NUMBER IN HOUSEHOLD"
hh2dhshldchd="R2 D TOTAL CHILDREN IN HOUSEHOLD"
hh2dspouseid="R2 D SPOUSE ID"
cs2sistrsnum="R2 CS14 NUMBER OF LIVING SISTERS"
cs2brthrsnum="R2 CS15 NUMBER OF LIVNG BROTHERS"
cs2dnumchild="R2 D NUMBER OF CHILDREN"
cs2dnmstpchd="R2 D NUMBER OF STEP CHILDREN"
cs2dnumdaugh="R2 D NUMBER OF DAUGHTERS"
cs2dnumson="R2 D NUMBER OF SONS"
sn2dnumsn="R2 D NUMBER IN SOCIAL NETWORK"
fl2noonetalk="R2 F SN SP HAS NO ONE TO TALK TO"
ho2entrstair="R2 HO1 ENTRANCE STAIRS OUTSIDE"
ho2entrccomn="R2 HO2 ENTRANCE COMMON OR PRIVAT"
ho2entrnramp="R2 HO3 RAMP AT ENTRANCE"
ho2bldgamen1="R2 HO4A NEW RES BLDG HAS ELEVATOR"
ho2bldgamen2="R2 HO4B NEW RES BLDG STAIR LIFT GLIDE"
ho2bldgamen3="R2 HO4C NEW RES BLDG COMMN SPACE MEALS"
ho2bldgamen4="R2 HO4D NEW RES BLDG SPACE SOCIAL EVT"
ho2levelsflr="R2 HO5 NUMBR OF LEVELS OR FLOORS"
ho2homeamen1="R2 H08A BED KITCHN BATH SAME FLR"
ho2homeamen2="R2 H08B HOME HAS ELEVATOR"
ho2homeamen3="R2 H08C HOME HAS STAIR LFT GLIDE"
ho2bathprivt="R2 H010 NEW FAC RES PRIV BATH"
ho2bathamen1="R2 H011A BATH HAS BATHTUB"
ho2bathamen2="R2 H011B BATH HAS SHOWER STALL"
ho2bathamen3="R2 H011C BATH GRAB BAR IN SHOWER"
ho2bathamen4="R2 H011D BATH SEAT FR SHOWER TUB"
ho2bathamen5="R2 H011E BATH RAISED TOILET SEAT"
ho2bathamen6="R2 H011F BATH GRAB BARS TOILET"
ho2bathamen7="R2 H011G BATH MED EMERGNCY SYSTM"
ho2kitchnprv="R2 HO12 NEW FAC RES PRIV KITCHEN"
ho2kitchncom="R2 H013 NEW FAC RES COMMON KITCHEN"
ho2microwave="R2 HO14 USE OF MICROWAVE"
ho2dbldg1="R2 D BLDG HAS ELEVATOR"
ho2dbldg2="R2 D BLDG HAS STAIR LIFT GLIDE"
ho2dbldg3="R2 D BLDG HAS COMMN SPACE MEALS"
ho2dbldg4="R2 D BLDG HAS SPACE SOCIAL EVENT"
ho2dbathprvt="R2 D FAC HAS PRIVATE BATH"
ho2dkitchnpr="R2 D FAC HAS PRIV KITCHEN"
ho2dkitchnco="R2 D FAC HAS COMMON KITCHEN"
fl2onefloor="R2 F HO SP LIVES ON ONE FLOOR"
fl2bathgrbbr="R2 F HO SPS BATH HAS GRAB BARS"
fl2bathseat="R2 F HO SPS BATH HAS SEAT"
fl2raisedtlt="R2 F HO SP HAS RAISED TOILET"
fl2tltgrbbr="R2 F HO SP TOILET HAS GRAB BARS"
em2modhere1="R2 EM1 NEW RES ALL ITEMS HERE"
em2addlstyr1="R2 EM2A RAMP ADDED IN LAST YR"
em2addlstyr2="R2 EM2B ELEVATOR ADDED IN LST YR"
em2addlstyr3="R2 EM2C STR LIFT ADDED IN LST YR"
em2addlstyr4="R2 EM2D SHWR GRABBAR ADD LST YR"
em2addlstyr5="R2 EM2E BATHSEAT ADDED IN LST YR"
em2addlstyr6="R2 EM2F TOILETSEAT ADD IN LST YR"
em2addlstyr7="R2 EM2G TOILET GRABBARS ADDED YR"
em2payyufam1="R2 EM3A SP PAID FOR RAMP"
em2payyufam2="R2 EM3B SP PAID FOR ELEVATOR"
em2payyufam3="R2 EM3C SP PAID STAIR LFT GLIDE"
em2payyufam4="R2 EM3D SP PAID SHOWER GRABBAR"
em2payyufam5="R2 EM3E SP PAID SHOWER SEAT"
em2payyufam6="R2 EM3F SP PAID RAISD TOILT SEAT"
em2payyufam7="R2 EM3G SP PAID TOILET GRABBARS"
em2paydevce1="R2 EM4A SP PAID FOR VISION AIDS"
em2paydevce2="R2 EM4B SP PAID FOR HEARING AID"
em2paydevce3="R2 EM4C SP PAID FOR CANE"
em2paydevce4="R2 EM4D SP PAID FOR WALKER"
em2paydevce5="R2 EM4E SP PAID FOR WHEELCHAIR"
em2paydevce6="R2 EM4F SP PAID FOR SCOOTER"
em2paydevce7="R2 EM4G SP PAID FOR GRABBER"
em2paydevce8="R2 EM4H SP PD SPECIAL DRESS ITM"
em2paydevce9="R2 EM4I SP PAID ADAPTED UTENSILS"
em2payaltgth="R2 EM5 PAY FOR THESE ALTOGETHER"
em2morls1000="R2 EM6 MORE LESS OR ABOUT $1000"
em2morls100="R2 EM7 MORE LESS OR ABOUT $100"
cm2knowwell="R2 CM1 PEOPL KNOW EACH OTHR WELL"
cm2willnghlp="R2 CM2 PEOPL WILLG HLP EACH OTHR"
cm2peoptrstd="R2 CM4 PEOPLE CAN BE TRUSTED"
te2cellphone="R2 TE1 WORKING CELL PHONE"
te2othrphone="R2 TE3 ONE PHONE OTHER THAN CELL"
te2computer="R2 TE6 HAS A WORKING COMPUTER"
te2compoth="R2 TE8 USED COMPUTER ANYWHRE ELS"
te2emailtext="R2 TE9 EMAIL OR TEXTING"
te2oftnemail="R2 TE10 EMAIL OR TEXTING OFTEN"
te2online="R2 TE11 ONLINE COMPUTER USE"
te2shoponli1="R2 TE12A INTERNET SHOP GROCERY"
te2shoponli2="R2 TE12B INTERNET BANKING"
te2shoponli3="R2 TE12C INTERNET ORDR REFLL RX "
te2intrntmd1="R2 TE13A INTERNET MEDICAL PROVDR"
te2intrntmd2="R2 TE13B INTERNET INSURANCE INFO"
te2intrntmd3="R2 TE13C INTERNET HEALTH CONDS"
md2canewlker="R2 MD1 USED CANE WALKER WHLCHAIR"
md2cane="R2 MD2 USED A CANE"
md2walker="R2 MD3 USED A WALKER"
md2wheelchar="R2 MD4 USED A WHEELCHAIR"
md2whelcrspc="R2 MD4A WHELCHAIR IN LIVNG SPACE"
md2scooter="R2 MD5 USE A SCOOTER"
md2scterinsp="R2 MD5A SCOOTER IN LIVING SPACE"
fl2cane="R2 F MD SP USES CANE"
fl2walker="R2 F MD SP USES WALKER"
fl2wheelchr="R2 F MD SP USES WHEELCHAIR"
fl2whlchrhom="R2 F MD SP HAS WHEELCHR AT HOME"
fl2scooter="R2 F MD SP USES SCOOTER"
fl2scooterhm="R2 F MD SP HAS SCOOTER AT HOME"
ss2heringaid="R2 SS3 HEARING AID USED"
ss2hearphone="R2 SS4A SP CAN USE TELEPHONE"
ss2convwradi="R2 SS4B CONVERSATIN WTH TV RADIO"
ss2convquiet="R2 SS4C CONVERS IN QUIET ROOM"
ss2glasseswr="R2 SS7 WEARS GLASSES CONTCTS"
ss2seewellst="R2 SS8A SEES ACROSS THE STREET"
ss2seestvgls="R2 SS8B TV ACROSS ROOM W GLASSES"
ss2glasscls="R2 SS10 WEAR GLS CONTCS SEE CLOS"
ss2othvisaid="R2 SS11 USED OTHER VISION AIDS"
ss2glrednewp="R2 SS12 CAN READ NEWSPAPER PRINT"
ss2probchswl="R2 SS13 PROBLEMS CHEW OR SWALLOW"
ss2probspeak="R2 SS14 PROBLEMS SPEAKING"
ss2painbothr="R2 SS15 BOTHERED BY PAIN"
ss2painlimts="R2 SS17 PAIN EVER LIMTS ACTIVIT"
ss2painmedof="R2 SS18A LST MNTH OFTEN PAIN MED"
ss2painwhe1="R2 SS18B BACK PAIN IN LAST MNTH"
ss2painwhe2="R2 SS18B HIP PAIN IN LAST MONTH"
ss2painwhe3="R2 SS18B KNEE PAIN IN LAST MNTH"
ss2painwhe4="R2 SS18B FOOT PAIN IN LAST MNTH"
ss2painwhe5="R2 SS18B HAND PAIN IN LAST MNTH"
ss2painwhe6="R2 SS18B WRIST PAIN IN LAST MNTH"
ss2painwhe7="R2 SS18B SHOULDR PAIN LST MNTH"
ss2painwhe8="R2 SS18B HEAD PAIN IN LAST MNTH"
ss2painwhe9="R2 SS18B NECK PAIN IN LAST MNTH"
ss2painwhe10="R2 SS18B ARM PAIN IN LAST MNTH"
ss2painwhe11="R2 SS18B LEG PAIN IN LAST MNTH"
ss2painwhe12="R2 SS18B STOMACH PAIN LAST MNTH"
ss2painwhe13="R2 SS18B OTHR SPCFY PAIN LST MO"
ss2probbreat="R2 SS19 BREATHING PROBLEMS"
ss2prbbrlimt="R2 SS20 BREATH PROBLS LIMT ACTIV"
ss2strnglmup="R2 SS21 UPPER BOD STRENGTH LIMIT"
ss2uplimtact="R2 SS22 UP BOD STRNGTH LIMT ACT"
ss2lwrbodstr="R2 SS23 LOWER BODY STRNGTH LIMIT"
ss2lwrbodimp="R2 SS24 LWER BOD STRNGTH IMT ACT"
ss2lowenergy="R2 SS25 LOW ENERGY IN LAST MONTH"
ss2loenlmtat="R2 SS26 LOW ENERGY EVER LIM ACT"
ss2prbbalcrd="R2 SS27 BALANCE OR COORD PROBS"
ss2prbbalcnt="R2 SS28 BAL COORD PROB LIMIT ACT"
fl2deaf="R2 F SS DEAF PRIOR OR CURRENT ROUND "
fl2blind="R2 F SS BLIND PRIOR OR CURRENT ROUND"
pc2walk6blks="R2 PC1 ABLE TO WALK 6 BLOCKS"
pc2walk3blks="R2 PC2 ABLE TO WALK 3 BLOCKS"
pc2up20stair="R2 PC3 ABLE TO WALK UP 20 STAIRS"
pc2up10stair="R2 PC4 ABLE TO WALK UP 10 STAIRS"
pc2car20pnds="R2 PC5 ABLE TO CARRY 20 POUNDS"
pc2car10pnds="R2 PC6 ABLE TO CARRY 10 POUNDS"
pc2geonknees="R2 PC7 ABLE TO GET DOWN ON KNEES"
pc2bendover="R2 PC8 ABLE TO BEND OVER"
pc2hvobovrhd="R2 PC9 HEAVY OBJECT ABOVE HEAD"
pc2rechovrhd="R2 PC10 ABLE TO REACH OVERHEAD"
pc2opnjarwhd="R2 PC11 OPEN SEALED JAR W HANDS"
pc2grspsmobj="R2 PC12 ABLE GRASP SMALL OBJECTS"
cp2memrygood="R2 CP1 HOW GOOD MEMRY AT PRESNT"
cp2knownspyr="R2 CP2 KNOWN SP 4 AT LEAST A YR"
cp2chgthink1="R2 CP3A SP DIFF REMEMBER DATE"
cp2chgthink2="R2 CP3B SP REPEATS SELF"
cp2chgthink3="R2 CP3C SP DIFF REMEMBER APPT"
cp2chgthink4="R2 CP3D SP CHNG INTRST ACT HOB"
cp2chgthink5="R2 CP3E SP DIFF WITH MONEY MGMT"
cp2chgthink6="R2 CP3F SP DIFF LEARNG USE TOOL"
cp2chgthink7="R2 CP3G SP PRBLMS WITH JDGMNT"
cp2chgthink8="R2 CP3H SP DLY PRBLMS W THNK MEM"
cp2memcogpr1="R2 CP4A LOST IN FAMILIAR ENVIRON"
cp2memcogpr2="R2 CP4B SP WANDERD OFF NO RETRN"
cp2memcogpr3="R2 CP4C SP ABLE LEFT ALONE 1 HR"
cp2memcogpr4="R2 CP4D SP HEARS SEES THNGS"
cp2dad8dem="R2 D DEMENTIA REPORTED IN PRIOR AD8"
cg2speaktosp="R2 CG1A MAY SPEAK TO SP ASK QUES"
cg2quesremem="R2 CG1C START W QUES ABOUT MEMRY"
cg2reascano1="R2 CG1D SP CANT ANS DEMENTIA"
cg2reascano2="R2 CG1D SP CANT ANS UNABLE SPEAK"
cg2reascano3="R2 CG1D SP CANT ANS UNABLE HEAR"
cg2reascano4="R2 CG1D SP CANT ANS SP REFUSED"
cg2reascano5="R2 CG1D SP CANT ANS PROXY REFUSD"
cg2reascano6="R2 CG1D SP CANT ANS NOT PRESENT"
cg2reascano7="R2 CG1D SP CANT ANS SP TOO ILL"
cg2reascano8="R2 CG1D SP CANT ANS LANG BARRIER"
cg2reascano9="R2 CG1D SP CANT ANS OTHR SPECIFY"
cg2ratememry="R2 CG2 RATE YOUR MEMORY"
cg2ofmemprob="R2 CG3 OFTN MEMRY PROBS INTERFER"
cg2memcom1yr="R2 CG4 MEMRY COMPARD TO 1 YR AGO"
cg2todaydat1="R2 CG6Aa TODAY'S DATE CORRCT MNTH"
cg2todaydat2="R2 CG6Ab TODAY'S DATE CORRECT DAY"
cg2todaydat3="R2 CG6Ac TODAY'S DATE CORRECT YR"
cg2todaydat5="R2 CG6Ad USED AID FOR MTH DAY YEAR"
cg2todaydat4="R2 CG6Ba TODAY'S DATE CORRCT DOW"
cg2todaydat6="R2 CG6Bb USED AID FOR DAY OF WEEK"
cg2prewrdrcl="R2 CG7PRE INTRO TO WORD RECALL"
cg2dwrdlstnm="R2 D WHICH WORD LIST ASSIGNED"
cg2wrdsrcal1="R2 CG8 1 TELL WORDS U CAN RECALL"
cg2wrdsrcal2="R2 CG8 2 TELL WORDS U CAN RECALL"
cg2wrdsrcal3="R2 CG8 3 TELL WORDS U CAN RECALL"
cg2wrdsrcal4="R2 CG8 4 TELL WORDS U CAN RECALL"
cg2wrdsrcal5="R2 CG8 5 TELL WORDS U CAN RECALL"
cg2wrdsrcal6="R2 CG8 6 TELL WORDS U CAN RECALL"
cg2wrdsrcal7="R2 CG8 7 TELL WORDS U CAN RECALL"
cg2wrdsrcal8="R2 CG8 8 TELL WORDS U CAN RECALL"
cg2wrdsrcal9="R2 CG8 9 TELL WORDS U CAN RECALL"
cg2wrdsrca10="R2 CG8 10 TELLWORDS U CAN RECALL"
cg2dwrdimmrc="R2 D SCORE IMMEDIATE WORD RECALL"
cg2dwrdinone="R2 D IMMEDIATE RECALL NONE"
cg2dwrdirref="R2 D IMMEDIATE RECALL REFUSED"
cg2wrdsntlst="R2 CG8A WORDS NOT ON LIST"
cg2numnotlst="R2 CG8B NUM WORDS NOT ON LIST"
cg2probreca1="R2 CG9 SP HAD DIFF HEARING WORDS"
cg2probreca2="R2 CG9 INTERRUPTION AS LIST READ"
cg2probreca3="R2 CG9 PROB WORD RECALL SPECIFY"
cg2probreca4="R2 CG9 WD RECALL NO PROB OCCURRD"
cg2probreca5="R2 CG9 SP REFUSED WORD RECALL"
cg2dclkdraw="R2 D SCORE OF CLOCK DRAWING TEST"
cg2dclkimgcl="R2 D IMAGE CLARITY CLOCK DRAWING"
cg2atdrwclck="R2 CG10A SP ATTEMPT CLOCK DRAWIG"
cg2presidna1="R2 CG13A PRES LAST NAME CORRECT"
cg2presidna2="R2 CG13B PRES LAST NAME INCORRCT"
cg2presidna3="R2 CG13C PRES FIRST NAME CORRCT"
cg2presidna4="R2 CG13D PRES FIRST NAME INCORR"
cg2vpname1="R2 CG14A VP LAST NAME CORRECT"
cg2vpname2="R2 CG14B VP LAST NAME INCORRECT"
cg2vpname3="R2 CG14C VP FIRST NAME CORRECT"
cg2vpname4="R2 CG14D VP FIRST NAME INCORRECT"
cg2wrdsdcal1="R2 CG15 1 DELAYED WORD RECALL"
cg2wrdsdcal2="R2 CG15 2 DELAYED WORD RECALL"
cg2wrdsdcal3="R2 CG15 3 DELAYED WORD RECALL"
cg2wrdsdcal4="R2 CG15 4 DELAYED WORD RECALL"
cg2wrdsdcal5="R2 CG15 5 DELAYED WORD RECALL"
cg2wrdsdcal6="R2 CG15 6 DELAYED WORD RECALL"
cg2wrdsdcal7="R2 CG15 7 DELAYED WORD RECALL"
cg2wrdsdcal8="R2 CG15 8 DELAYED WORD RECALL"
cg2wrdsdcal9="R2 CG15 9 DELAYED WORD RECALL"
cg2wrdsdca10="R2 CG15 10 DELAYED WORD RECALL"
cg2dwrddlyrc="R2 D SCORE DELAYED WORD RECALL"
cg2dwrddnone="R2 D DELAYED RECALL NONE"
cg2dwrddrref="R2 D DELAYED RECALL REFUSED"
cg2wrdnotlst="R2 CG16 WORDS NOT ON LIST"
cg2numwrdnot="R2 CG17 NUM OF WORDS NOT ON LIST"
cg2dwrd1rcl="R2 D WORD1 IMMEDIATE RECALL"
cg2dwrd2rcl="R2 D WORD2 IMMEDIATE RECALL"
cg2dwrd3rcl="R2 D WORD3 IMMEDIATE RECALL"
cg2dwrd4rcl="R2 D WORD4 IMMEDIATE RECALL"
cg2dwrd5rcl="R2 D WORD5 IMMEDIATE RECALL"
cg2dwrd6rcl="R2 D WORD6 IMMEDIATE RECALL"
cg2dwrd7rcl="R2 D WORD7 IMMEDIATE RECALL"
cg2dwrd8rcl="R2 D WORD8 IMMEDIATE RECALL"
cg2dwrd9rcl="R2 D WORD9 IMMEDIATE RECALL"
cg2dwrd10rcl="R2 D WORD10 IMMEDIATE RECALL"
cg2dwrd1dly="R2 D WORD1 DELAYED RECALL"
cg2dwrd2dly="R2 D WORD2 DELAYED RECALL"
cg2dwrd3dly="R2 D WORD3 DELAYED RECALL"
cg2dwrd4dly="R2 D WORD4 DELAYED RECALL"
cg2dwrd5dly="R2 D WORD5 DELAYED RECALL"
cg2dwrd6dly="R2 D WORD6 DELAYED RECALL"
cg2dwrd7dly="R2 D WORD7 DELAYED RECALL"
cg2dwrd8dly="R2 D WORD8 DELAYED RECALL"
cg2dwrd9dly="R2 D WORD9 DELAYED RECALL"
cg2dwrd10dly="R2 D WORD10 DELAYED RECALL"
mo2outoft="R2 MO1 OFTEN GO OUTSIDE"
mo2outcane="R2 MO2 CANE USED OUTSIDE"
mo2outwalkr="R2 MO3 WALKER USED OUTSIDE"
mo2outwlchr="R2 MO4 WHEELCHAIR USED OUTSIDE"
mo2outsctr="R2 MO5 SCOOTER USED OUTSIDE"
mo2outhlp="R2 MO6 HELP GO OUTSIDE"
mo2outslf="R2 MO7 LEFT BY YOURSELF"
mo2outdif="R2 MO8 HOW DIFFICULT"
mo2outyrgo="R2 MO9 HOW OFTEN LEAVE"
mo2outwout="R2 MO10 STAYED IN NO HELP"
mo2oftgoarea="R2 MO11 HOW OFTEN GO OTHER AREAS"
mo2oflvslepr="R2 MO12 HOW OFTN LEAVE BEDROOM"
mo2insdcane="R2 MO13 OFTEN USED CANE INSIDE"
mo2insdwalkr="R2 MO14 OFTEN USED WALKER INSIDE"
mo2insdwlchr="R2 MO15 OFT USD WHEELCHAR INSIDE"
mo2insdsctr="R2 MO16 OFTEN USD SCOOTER INSIDE"
mo2oftholdwl="R2 MO17 OFTEN HOLD WALLS INSIDE"
mo2insdhlp="R2 MO18 GOT HELP INSIDE"
mo2insdslf="R2 MO20 HOW OFTEN BY YOURSELF"
mo2insddif="R2 MO21 HOW DIFF GET ARD W DEVCE"
mo2insdyrgo="R2 MO22 HOW OFTEN COMPRED YR AGO"
mo2insdwout="R2 MO23 PLACES INSIDE DID NOT GO"
mo2beddev="R2 MO24 OUT OF BED USED DEVICE"
mo2bedhlp="R2 MO25 GOT HELP OUT OF BED"
mo2bedslf="R2 MO26 OFT GOT OUT BED BY SLF"
mo2beddif="R2 MO27 DIFF GET OUT BED BY SELF"
mo2bedwout="R2 MO28 OFTEN HAD TO STAY IN BED"
mo2doutsfdf="R2 D GO OUTSIDE SELF "
mo2doutdevi="R2 D GO OUTSIDE USING DEVICES"
mo2douthelp="R2 D GO OUTSIDE USING HELP"
mo2dinsdsfdf ="R2 D MOVE INSIDE SELF"
mo2dinsddevi="R2 D MOVE INSIDE WITH DEVICES"
mo2dinsdhelp="R2 D MOVE INSIDE WITH HELP"
mo2dbedsfdf="R2 D GET OUT OF BED"
mo2dbeddevi="R2 D DEVICE USE 2 GET OUT OF BED"
mo2dbedhelp="R2 D HELP TO GET OUT OF BED"
fl2didntleav="R2 F MO SP DID NOT LEAVE HOME"
fl2ntlvrmslp="R2 F MO SP DID NOT LEAVE BEDROOM"
dm2helpmobil="R2 DM1 GET HELP WITH MOBILITY"
dm2helpstmo="R2 DM3C MONTH MOBIL HELP STARTED"
dm2helpstyr="R2 DM3C1 YEAR MOBIL HELP STARTED"
dm2helpendmo="R2 DM3D MONTH MOBIL HELP ENDED"
dm2helpendyr="R2 DM3D1 YEAR MOBIL HELP ENDED"
dm2nohelp="R2 DM3E NO MOBIl HELP MTH PLUS"
dm2nohelpmos="R2 DM3F MONTHS OF NO MOBIl HELP"
dm2lstyrcane="R2 DM4 IN LST YR USE CANE WALKER"
dm2devstmo="R2 DM6C MONTH DEVICE USE STARTED"
dm2devstyr="R2 DM6C1 YEAR DEVICE USE STARTED"
dm2devendmo="R2 DM6D MONTH DEVICE USE ENDED"
dm2devendyr="R2 DM6D1 YEAR DEVICE USE ENDED"
dm2nodev="R2 DM6E NO DEVICE MONTH PLUS"
dm2nodevmos="R2 DM6F MONTHS OF NO DEVICE"
dmds2dintvl="R2 D MTHS FROM LAST INT TO CURR INT OR DEATH"
dm2dmohlp="R2 D MONTHS OF MOBILITY HELP"
dm2dmodev="R2 D MONTHS OF MOBILITY DEVICE HELP"
dm2dmohlpgr="R2 D MOBILITY HELP GROUP"
dm2dmodevgr="R2 D MOBILITY DEVICE GROUP"
dm2flag="R2 D SPECIAL CASES DM SECTION ROUTE"
dt2driveyr="R2 DT1A DRIVE IN LAST YEAR"
dt2oftedrive="R2 DT1 HOW OFTEN DRIVE PLACES"
dt2avoidriv1="R2 DT3A AVOID DRIVING AT NIGHT"
dt2avoidriv2="R2 DT3A AVOID DRIVING ALONE"
dt2avoidriv3="R2 DT3A AVOID DRIVING HIGHWAYS"
dt2avoidriv4="R2 DT3A AVOID DRIVING BAD WEATHER"
dt2getoplcs1="R2 DT4A SP WALKED GOT PLACES"
dt2getoplcs2="R2 DT4B GOT RIDE FAM FRIEND PD"
dt2getoplcs3="R2 DT4C VANSHUTTLE PROV BY PLACE"
dt2getoplcs4="R2 DT4D VAN SHUTTLE FOR SENIORS"
dt2getoplcs5="R2 DT4E SP TOOK PUBLIC TRANSPRT"
dt2getoplcs6="R2 DT4F SP TOOK TAXI GOT PLACES"
dt2getoplcs7="R2 DT4G GOT PLACES OTHR SPECIFY"
dt2otfrfamtk="R2 DT6 ANTH FND FAM MEM TOOK YOU"
fl1dneverdrv="R1 F DT SP NEVER DROVE"
fl2drives="R2 F DT SP DRIVES CAR"
fl2drvlstyr="R2 F DT SP DROVE CAR IN PAST YR"
ha2laun="R2 HA1 HOW LAUNDRY GOT DONE"
ha2launslf="R2 HA1A DO LAUNDRY YOURSELF"
ha2whrmachi1="R2 HA2 WASH MACHINE IN HOME"
ha2whrmachi2="R2 HA2 WASH MACHIN IN BUILDING"
ha2whrmachi3="R2 HA2 WASH MACHIN LAUNDROMAT"
ha2whrmachi4="R2 HA2 WASH MACHIN SINK IN HOME"
ha2whrmachi5="R2 HA2 WASH MACH SINK IN BUILDNG"
ha2whrmachi6="R2 HA2 WASH MACHIN OTHR SPECIFY"
ha2dlaunreas="R2 D LAUNDRY REASN WITH BY OTHERS"
ha2laundif="R2 HA5 DIFF DOING LAUNDY BY SELF"
ha2launoft="R2 HA6 HOW OFTEN DO LAUNDRY"
ha2launwout="R2 HA7 EVER GO WOUT CLEAN LAUNDR"
ha2shop="R2 HA20 HOW YOUR SHOPPING DONE"
ha2shopslf="R2 HA20A EVER SHOP BY YOURSELF"
ha2howpaygr1="R2 HA22 PAY GROC PERS ITMS CASH"
ha2howpaygr2="R2 HA22 PAY GROC PERS ITMS CHCK"
ha2howpaygr3="R2 HA22 PAY GROC PERS ITMS DEBIT"
ha2howpaygr4="R2 HA22 PAY GROC PERS CREDIT"
ha2howpaygr5="R2 HA22 PAY GROC PERS FOOD STMP"
ha2howpaygr6="R2 HA22 PAY GROC PERS SMON ELS"
ha2howpaygr7="R2 HA22 PAY GROC PERS OTHR SPEC"
ha2howgtstr1="R2 HA23 DROVE TO THE STORE"
ha2howgtstr2="R2 HA23 FAM FRND PD HLP DROVE"
ha2howgtstr3="R2 HA23 VAN PLACE SP LIVES DROVE"
ha2howgtstr4="R2 HA23 VAN 4 DIS SENIORS DROVE"
ha2howgtstr5="R2 HA23 PUBLIC TRANSPORT 2 STORE"
ha2howgtstr6="R2 HA23 SP TOOK TAXI 2 THE STORE"
ha2howgtstr7="R2 HA23 SP WALKED TO THE STORE"
ha2howgtstr8="R2 HA23 OTHR SPECIFY TO STORE"
ha2shopcart="R2 HA24A EVER USE MOTORIZED CART"
ha2shoplean="R2 HA24B EVER LEAN ON SHOP CART"
ha2dshopreas="R2 D SHOP REASN WITH BY OTHERS "
ha2shopdif="R2 HA27 DIFF SHOPPING BY SELF"
ha2shopoft="R2 HA28 HOW OFT SHOP GROCERIES"
ha2shopwout="R2 HA29 EVER GO WITHOUT GROCRIES"
ha2meal="R2 HA30 HOW HOT MEALS GET MADE"
ha2mealslf="R2 HA30A MAKE HOT MEALS YOURSELF"
ha2restamels="R2 HA30B OFTN HAV RESTARNT MEALS"
ha2oftmicrow="R2 HA31 OFTEN USE THE MICROWAVE"
ha2dmealreas="R2 D MEALS REASN WITH BY OTHERS"
ha2mealdif="R2 HA34 DIFICULTY MAK MEALS SELF"
ha2mealoft="R2 HA35 HOW OFTEN MAKE HOT MEALS"
ha2mealwout="R2 HA36 EVER GO WITHOUT HOT MEAL"
ha2bank="R2 HA40 HOW BILLS BANKIN HANDLED"
ha2bankslf="R2 HA40A HNDL BILLS BNKING YRSLF"
ha2dbankreas="R2 D BANK BILL REASN WITH BY OTH"
ha2bankdif="R2 HA44 DIF HNDL BLLS BNKING SLF"
ha2bankoft="R2 HA45 HOW OFTEN YOU PAY BILLS"
ha2bankwout="R2 HA46 EVER GO WOUT PAYIN BILLS"
ha2money="R2 HA50 MONEY MATTERS TO HANDLE"
ha2moneyhlp="R2 HA51 ANYONE HLP W MONY MATTRS"
ha2dlaunsfdf="R2 D LAUNDRY SELF AND DIFF LEVEL"
ha2dshopsfdf="R2 D SLF SHOPPING AND DIFF LEVEL"
ha2dmealsfdf="R2 D SELF MEALS AND DIFF LEVEL"
ha2dbanksfdf="R2 D SELF BANKS AND DIFF LEVEL"
ha2dmealwhl ="R2 D HELPER IS MEALS ON WHEELS"
ha2dmealtkot ="R2 D HELPER IS RESTAURNT TAKEOUT"
sc2eatdev="R2 SC1 EVER USE ADAPTED UTENSILS"
sc2eatdevoft="R2 SC2 OFTEN USE ADAPTED UTENSLS"
sc2eathlp="R2 SC3 DID ANYONE HELP YOU EAT"
sc2eatslfoft="R2 SC4 HOW OFTEN EAT BY YOURSELF"
sc2eatslfdif="R2 SC5 DIFFICULTY EATING BY SELF"
sc2eatwout="R2 SC6 GO WOUT EAT BECSE NO HELP"
sc2showrbat1="R2 SC7 SP SHOWERED"
sc2showrbat2="R2 SC7 SP TOOK BATHS IN A TUB"
sc2showrbat3="R2 SC7 SP WASHED SOME OTHR WAY"
sc2bdevdec="R2 SC7A USE BATH DEVICE IN LML"
sc2prfrshbth="R2 SC8 PREFER SHOWR BATH OR OTHR"
sc2scusgrbrs="R2 SC9 HOW OFTEN USE GRAB BARS"
sc2shtubseat="R2 SC10 OFTN USE SHOWR TUB SEAT"
sc2bathhlp="R2 SC11 ANYN HLP SHOWR BATH OTHR"
sc2bathoft="R2 SC12 HOW OFTEN BATHE YOURSELF"
sc2bathdif="R2 SC13 DIFF USING BARS OR SEATS"
sc2bathyrgo="R2 SC14 BATHE MRE OFT THN YR AGO"
sc2bathwout="R2 SC15 EVER GO WITHOUT WASHING"
sc2usvartoi1="R2 SC16 SP USED PORTABLE COMMODE"
sc2usvartoi2="R2 SC16 SP USED PADS UNDERGMT"
sc2usvartoi3="R2 SC16 USED GRABBARS FR TOILET"
sc2usvartoi4="R2 SC16 USED RAISED TOILET SEAT"
sc2toilhlp="R2 SC17 ANYON HLP YOU USE TOILET"
sc2toiloft="R2 SC18 OFTEN USE TOILET BY SELF"
sc2toildif="R2 SC19 DIFFICUTY TOILETING SELF"
sc2toilwout="R2 SC20 ACCIDENT WET SOIL CLTHES"
sc2dresoft="R2 SC21 OFTEN YOU GET DRESSED"
sc2dresdev="R2 SC22 USE SPECL ITEMS TO DRESS"
sc2dreshlp="R2 SC23 ANYONE HELP GET DRESSED"
sc2dresslf="R2 SC24 OFTEN YOU DRESS YOURSELF"
sc2dresdif="R2 SC25 DIF WHN US SP ITMS YRSLF"
sc2dresyrgo="R2 SC26 HOW OFTN YOU GET DRESSED"
sc2dreswout="R2 SC27 GO WITHOUT GTTNG DRESSED"
sc2deatdevi="R2 D USES DEVICES WHILE EATING"
sc2deathelp="R2 D HAS HELP EATING"
sc2deatsfdf="R2 D DIFF EATING BY SELF WO HELP"
sc2dbathdevi="R2 D USES DEVICES WHILE BATHING"
sc2dbathhelp="R2 D HAS HELP WHILE BATHING"
sc2dbathsfdf="R2 D DIFF BATHING SELF NO HELP"
sc2dtoildevi="R2 D USES DEVICE WHILE TOILETING"
sc2dtoilhelp="R2 D HAS HELP WHILE TOILETING"
sc2dtoilsfdf="R2 D DIFF LEVEL TOILETING SELF"
sc2ddresdevi="R2 D USES DEVICES WHILE DRESSING"
sc2ddreshelp="R2 D HAS HELP WHILE DRESSING"
sc2ddressfdf="R2 D DIFF LEVEL DRESSING SELF"
fl2showering="R2 F SC SP USES SHOWER"
fl2takingbth="R2 F SC SP TAKES BATHS"
fl2washingup="R2 F SC SP WASHES OTHER WAY"
ds2gethlpeat="R2 DS1 GET HELP WITH EATING, ETC"
ds2helpstmo="R2 DS3C MONTH SELF CARE HLP START"
ds2helpstyr="R2 DS3C1 YEAR SELF CARE HELP STARTED"
ds2helpendmo="R2 DS3D MONTH SELF CARE HELP ENDED"
ds2helpendyr="R2 DS3D1 YEAR SELF CARE HELP ENDED"
ds2nohelp="R2 DS3E NO SELF CARE HELP MTH PLUS"
ds2nohelpmos="R2 DS3F MONTHS OF NO SELF CARE HELP"
ds2dschlp="R2 D MONTHS OF SELF CARE HELP"
ds2dschlpgr="R2 D SELF CARE HELP GROUP"
ds2flag="R2 D SPECIAL CASES DS SECTION ROUTE"
mc2meds="R2 MC1 IN MNTH TKE MEDS PRESCRBD"
mc2medstrk="R2 MC2 KEEP TRCK PRESCRIED MEDS"
mc2medsslf="R2 MC2A LAST MNTH KEEP TRACK SLF"
mc2whrgtmed1="R2 MC3 SP GOT MEDS LOCAL STORE"
mc2whrgtmed2="R2 MC3 SP GOT MEDS BY MAIL"
mc2whrgtmed3="R2 MC3 SP GOT MEDS HC PRVDR HSP"
mc2whrgtmed4="R2 MC3 SP GOT MEDS OTHR SPECIFY"
mc2howpkupm1="R2 MC3B SP PICKD UP MEDS BY SELF"
mc2howpkupm2="R2 MC3B SP HAD MEDS DELIVERED"
mc2howpkupm3="R2 MC3B SMEON ELSE PICKD UP MEDS"
mc2medsrem="R2 MC4 USE REMNDERS TO KEEP TRCK"
mc2dmedsreas="R2 D MEDS REASN BY WITH OTHERS "
mc2medsdif="R2 MC7 HOW DIFFIC KEEP TRACK MED"
mc2medsyrgo="R2 MC8 COMPAR YR AGO HW KEP TRCK"
mc2medsmis="R2 MC9 MAKE MISTAKE TAKING MEDS"
mc2havregdoc="R2 MC10 YOU HAVE REGULAR DOCTOR"
mc2regdoclyr="R2 MC12 SEEN REG DOC WTHN LST YR"
mc2hwgtregd1="R2 MC15 SP DROVE SELF TO REG DOC"
mc2hwgtregd2="R2 MC15 FAM PD HLP DRVE REG DOC"
mc2hwgtregd3="R2 MC15 VAN PLCE SP LIVE REG DOC"
mc2hwgtregd4="R2 MC15 VAN FR DIS SENIOR REG DC"
mc2hwgtregd5="R2 MC15 PUBLIC TRANSPORT REG DOC"
mc2hwgtregd6="R2 MC15 SP TOOK TAXI TO REG DOC"
mc2hwgtregd7="R2 MC15 SP WALKED TO REG DOC"
mc2hwgtregd8="R2 MC15 REG DOC WAS HOME VISIT"
mc2hwgtregd9="R2 MC15 OTHR SPECIFY REG DOC"
mc2ansitindr="R2 MC16 ANONE SIT IN W YOU AT DR"
mc2tpersevr1="R2 MC19 HLP UPTO EXAM TBL DRESS"
mc2tpersevr2="R2 MC19 REMND SP OF QSTNS FR DOC"
mc2tpersevr3="R2 MC19 ASK TELL DOC THINGS 4 SP"
mc2tpersevr4="R2 MC19 HLP SP UNDERSTAND DOC"
mc2chginspln="R2 MC20 CHGD ADD INS OR DRUG PLN"
mc2anhlpwdec="R2 MC21 ANYONE HELP W DECISION"
mc2dmedssfdf="R2 D DIFF LEVEL MEDICATIONS SELF"
pa2vistfrfam="R2 PA1 EVER VISIT FRIENDS FAMILY"
pa2hlkepfvst="R2 PA2 HLTH KP FR VIST FAM FRNDS"
pa2trkpfrvis="R2 PA3 TRAN PRB KP FR VST FRNDS"
pa2impvstfam="R2 PA4 IMPRTNT VISIT FRNDS FAMLY"
pa2attrelser="R2 PA5 EVER ATTEND RELIG SERVCES"
pa2htkfrrlsr="R2 PA6 HEALTH KEEP FRM RELI SERV"
pa2trprrelsr="R2 PA7 TRAN PRO KEEP FM RELG SER"
pa2imprelser="R2 PA8 HW IMPORT ARE RELIG SERVS"
pa2clbmtgrac="R2 PA9 CLUB MEETINGS GRP ACTIVES"
pa2hlkpfrclb="R2 PA10 HELTH KEP FRM CLB MTINGS"
pa2trprkpfgr="R2 PA11 TRANS PROB KEEP FM GROPS"
pa2imparclub="R2 PA12 IMPORT PARTIC CLUBS GRUP"
pa2outfrenjy="R2 PA13 EVER GO OUT FOR ENJOYMNT"
pa2hlkpgoenj="R2 PA14 HLTH KP GO OUT FOR ENJOY"
pa2trprgoout="R2 PA15 TRANSPROB KEEP FM GO OUT"
pa2impouteny="R2 PA16 IMPORT GO OUT FOR ENJOYT"
pa2workfrpay="R2 PA17 EVER WORK FOR PAY"
pa2hlkpfrwrk="R2 PA18 HEALTH KEEP YOU FRM WORK"
pa2voltrwork="R2 PA19 EVER DO VOLUNTEER WORK"
pa2hlkpfrvol="R2 PA20 HELTH KEEP FM VOLUNTRING"
pa2prcranoth="R2 PA21 PROVIDE CARE ANTHER PERS"
pa2evrgowalk="R2 PA23 EVER GO WALKING"
pa2vigoractv="R2 PA24 EVER VIGOROUS ACTIVITIES"
pa2dofavact="R2 PA25A GET TO DO FAV ACT LST YR"
pa2helmfvact="R2 PA26 HEALTH LIMIT FAV ACTIVTY"
pa1dv2favact="R1 D VERSION 2 FAVORITE ACTIVITY"
sd2smokesnow="R2 SD2 SMOKES NOW"
sd2numcigday="R2 SD3 NUM OF CIGARETTES PER DAY"
pe2whhndsign="R2 PE1 HAND USE TO SIGN YOR NAME"
pe2surghdwrt="R2 PE2 HAVE SURGRY TO HAND WRIST"
pe2surgyside="R2 PE3 WHICH SIDE WAS SURGERY"
pe2flruppain="R2 PE4 EXPER FLARE UP PAIN HAND"
pe2sideflrup="R2 PE5 SIDE CURRNT FLARE UP PAIN"
pe2surgarmsh="R2 PE6 SURGERY ARM OR SHOULDER"
pe2sidsurgar="R2 PE7 SIDE SURGERY ARM OR SHLDR"
pe2surgyhips="R2 PE8 SURG HIPS INCLUD REPLCMNT"
pe2sidhipsrg="R2 PE9 SIDE WAS HIP SURGERY ON"
pe2stndwhold="R2 PE11 STAND WITHOUT HOLDING ON"
pe2upchbyslf="R2 PE12 GET UP OUT CHAIR BY SELF"
pe2wlkdsself="R2 PE13 WALK SHORT DIST BY SELF"
fl2lefthand="R2 F PE CAN SP DO LEFT HAND TEST"
fl2righthand="R2 F PE CAN SP DO RGT HAND TEST"
fl2eiherhand="R2 F PE CAN SP DO EITHR HAND TST"
fl2lftgrptst="R2 F PE CAN SP DO LFT GRIP TEST"
fl2rhtgrptst="R2 F PE CAN SP DO RIGHT GRIP TST"
fl2charstnds="R2 F PE CAN SP DO CHAIR STANDS"
fl2balstands="R2 F PE CAN SP DO BALANCE STANDS"
fl2wlkingrse="R2 F PE CAN SP DO WALKING COURSE"
ba2dblssadm="R2 D BALANCE SIDE BY SIDE ADMIN"
ba2dblstadm="R2 D BALANCE SEMI TANDEM ADMIN"
ba2dblftadm="R2 D BALANCE FULL TANDEM ADMIN"
ba2dblopadm="R2 D BALANCE 1 LEG OP EYE ADMIN"
ba2dblcladm="R2 D BALANCE 1 LEG CLS EYE ADMIN"
wa2dwlkadm="R2 D WALKING COURSE ADMIN"
ch2dschradm="R2 D SINGLE CHAIR ADMIN"
ch2drchradm="R2 D REPEAT CHAIR ADMIN"
gr2dgripadm="R2 D GRIP STRENGTH ADMIN"
wc2dwaistadm="R2 D WAIST CIRCUMFERENCE ADMIN"
pk2dpeakadm="R2 D PEAK AIR FLOW ADMIN"
ab2datemonth="R2 AB COVER DATE MONTH"
ab2dateyear="R2 AB COVER DATE YEAR"
in2strtabhrs="R2 IN8 START TIME HOURS"
in2strtabmin="R2 IN8 START TIME MINUTES"
in2strtmampm="R2 IN8 START TIME AM OR PM"
ba2sxsresult="R2 BA3 SIDE BY SIDE STAND RESULT"
ba2blstdsecs="R2 BA4A SECS SIDE BY SIDE STAND"
ba2blstdhndr="R2 BA4B HNRDS SIDE BY SIDE STND"
ba2rsn1ssstd="R2 BA5 1 NO STAND SP FELT UNSAFE"
ba2rsn2ssstd="R2 BA5 2 NO STAND PRXY FELT UNSF"
ba2rsn3ssstd="R2 BA5 3 NO STND INTWR FELT UNSF"
ba2rsn4ssstd="R2 BA5 4NO STND SP UNABL2UNDRSTD"
ba2rsn9ssstd="R2 BA5 9 NO STAND OTHER SPECIFY"
ba2stdmreslt="R2 BA7 SEMI TANDEM STAND RESULT"
ba2stdmsecs="R2 BA8A SECS HELD SEMI TANDM STD"
ba2stdmhndr="R2 BA8B HNRDS HLD SEMI TANDM STD"
ba2rsn1ststd="R2 BA9 1 NO STNDM SP FELT UNSAFE"
ba2rsn2ststd="R2 BA9 2NO STNDM PRXY FELT UNSAF"
ba2rsn3ststd="R2 BA9 3 NO STNDM INTR FELT UNSF"
ba2rsn4ststd="R2 BA9 4NO STNDM SP UNABL2UNDSTD"
ba2rsn9ststd="R2 BA9 9 NO STNDM OTHER SPECIFY"
ba2ftdmreslt="R2 BA11 FULL TANDEM STAND RESULT"
ba2ftdmsecs="R2 BA12A SECS HLD FULL TANDM STD"
ba2ftdmhndr="R2 BA12B HNRDS HLD FLL TANDM STD"
ba2rsn1ftstd="R2 BA13 1 NO FTNDM SP FLT UNSAFE"
ba2rsn2ftstd="R2 BA13 2NO FTNDM PRXY FLT UNSAF"
ba2rsn3ftstd="R2 BA13 3 NO FTNDM INTR FLT UNSF"
ba2rsn4ftstd="R2 BA13 4NO FTNDM SP UNABL2UNDST"
ba2rsn9ftstd="R2 BA13 9 NO FTNDM OTHER SPECIFY"
ba21leoreslt="R2 BA15 ONE LEG STAND EYES OPEN"
ba21leosfsec="R2 BA16A SECS HLD 1LEG EYES OPEN"
ba21leohndr="R2 BA16B HNRDS HLD 1LEG EYE OPEN"
ba2rsn11leo="R2 BA17 1 NO1LEGEO SP FLT UNSAFE"
ba2rsn21leo="R2 BA17 2NO1LEGEO PRXY FLT UNSAF"
ba2rsn31leo="R2 BA17 3 NO1LEGEO INTR FLT UNSF"
ba2rsn41leo="R2 BA17 4NO1LEGEO SP UNABL2UNDST"
ba2rsn91leo="R2 BA17 9NO1LEGEO OTHER SPECIFY"
ba21lecreslt="R2 BA19 ONE LEG STAND EYES CLOS"
ba21lecsfsec="R2 BA20A SECS HLD 1LEG EYES CLOS"
ba21lechndr="R2 BA20B HNRDS HLD 1LEG EYE CLOS"
ba2rsn11lec="R2 BA21 1 NO1LEGEC SP FLT UNSAFE"
ba2rsn21lec="R2 BA21 2NO1LEGEC PRXY FLT UNSAF"
ba2rsn31lec="R2 BA21 3 NO1LEGEC INTR FLT UNSF"
ba2rsn41lec="R2 BA21 4NO1LEGEC SP UNABL2UNDST"
ba2rsn91lec="R2 BA21 9NO1LEGEC OTHER SPECIFY"
wa2wlkcorspc="R2 WA2 WALKING COURSE SPACE"
wa2wkaidused="R2 WA4 WALKING AID USED COURSE 1"
wa2wlkc1rslt="R2 WA5 WALKING COURSE 1 RESULT"
wa2wlkc1secs="R2 WA6A SECS HLD WALKNG COURSE1"
wa2wlk1hndr="R2 WA6B HNRDS HLD WALKNG COURSE1"
wa2rsn11wkc="R2 WA7 1 WLKCOURS1 SP FLT UNSAFE"
wa2rsn21wkc="R2 WA7 2WLKCOURS1 PRXY FLT UNSAF"
wa2rsn31wkc="R2 WA7 3WLKCOURS1 INTR FLT UNSF"
wa2rsn41wkc="R2 WA7 4WLKCOURS1 SP UNABL2UNDST"
wa2rsn51wkc="R2 WA7 5WLKCOURS1 NOT APPR SPACE"
wa2rsn91wkc="R2 WA7 9WLKCOURS1 OTHER SPECIFY"
wa2wkaidusc2="R2 WA4 WALKING AID USED COURSE 2"
wa2wlkc2rslt="R2 WA9 WALKING COURSE 2 RESULT"
wa2wlkc2secs="R2 WA10A SECS HLD WALKNG COURSE2"
wa2wlk2hndr="R2 WA10B HNRDS HLD WALKNG COURS2"
wa2rsn12wkc="R2 WA11 1 WKCOURS2 SP FLT UNSAFE"
wa2rsn22wkc="R2 WA11 2WKCOURS2 PRXY FLT UNSAF"
wa2rsn32wkc="R2 WA11 3WKCOURS2 INTR FLT UNSF"
wa2rsn42wkc="R2 WA11 4WKCOURS2 SP UNABL2UNDST"
wa2rsn92wkc="R2 WA11 9WKCOURS2 OTHER SPECIFY"
ch2chravail="R2 CH2 APPROPRIATE CHAIR AVAIL"
ch2chstcompl="R2 CH4 CHAIR STND COMPLETED TRY1"
ch2chairheit="R2 CH5 CHAIR HEIGHT(INCHES)"
ch2whlchrusd="R2 CH6 WHEELCHAIR USED"
ch2sgchstres="R2 CH7 SINGLE CHAIR STAND RESLT"
ch2armuse="R2 CH8 CHAIR STAND ARM USE"
ch2rsn11chs="R2 CH9 1CH STAND1 SP FLT UNSAFE"
ch2rsn21chs="R2 CH9 2CH STAND1 PRXY FLT UNSAF"
ch2rsn31chs="R2 CH9 3CH STAND1 INTR FLT UNSF"
ch2rsn41chs="R2 CH9 4CH STAND1 SP UNABL2UNDST"
ch2rsn51chs="R2 CH9 5CH STAND1 NOT APPR CHAIR"
ch2rsn91chs="R2 CH9 9CH STAND1 OTHER SPECIFY"
ch22chstrslt="R2 CH12 REPEAT CHAIR STAND RSLTS"
ch2chstndsec="R2 CH13A TIME REPEAT CH STD SECS"
ch2chstdhndr="R2 CH13B TIME RPEAT CH STD HNRDS"
ch2chstddone="R2 CH14 NUMBER CHAIR STANDS DONE"
ch2chstntdn1="R2 CH15 1 CH STD SP TIRED"
ch2chstntdn2="R2 CH15 2 CH STD SP USED ARMS"
ch2chstntdn3="R2 CH15 3 CH STD OVER 1 MIN"
ch2chstntdn4="R2 CH15 4 CH STD CNCRN SP SAFETY"
ch2chstntdn5="R2 CH15 5 CH STD SP STOPPED"
ch2chstntdn9="R2 CH15 9 CH STD OTHERSPECIFY"
ch2chstntat1="R2 CH16 1 NO CH ST SP UNSAFE"
ch2chstntat2="R2 CH16 2 NO CH ST PRXY UNSAFE"
ch2chstntat3="R2 CH16 3 NO CH ST INTV UNSAFE"
ch2chstntat4="R2 CH16 4 NO CH ST SP UNAB2UNDST"
ch2chstntat9="R2 CH16 9 NO CH ST OTHER SPEC"
gr2handtstd1="R2 GR3 GRIP1 TEST WHICH HAND"
gr2adjgr1ps3="R2 GR4 GRIP1POSITION ADJUST TO 3"
gr2grp1reslt="R2 GR5 GRIP STRENGTH 1 RESULT"
gr2grp1rdng="R2 GR6 GRP1 DISPLAY READING"
gr2grp1noat1="R2 GR7 1 SP FELT UNSAFE"
gr2grp1noat2="R2 GR7 2 PROXY FELT UNSAFE"
gr2grp1noat3="R2 GR7 3 INTERVIEWR FELT UNSAFE"
gr2grp1noat4="R2 GR7 4 SP UNABLE 2 UNDERSTAND"
gr2grp1noat9="R2 GR7 9 OTHER SPECIFY"
gr2handtstd2="R2 GR8 GRIP2 TEST WHICH HAND"
gr2adjgr2ps3="R2 GR9 GRIP2POSITION ADJUST TO 3"
gr2grp2reslt="R2 GR10GRIP STRENGTH 2 RESULT"
gr2grp2rdng="R2 GR11GRP2 DISPLAY READING"
gr2grp2noat1="R2 GR12 1 SP FELT UNSAFE"
gr2grp2noat2="R2 GR12 2 PROXY FELT UNSAFE"
gr2grp2noat3="R2 GR12 3 INTERVIEWR FELT UNSAFE"
gr2grp2noat4="R2 GR12 4 SP UNABLE 2 UNDERSTAND"
gr2grp2noat9="R2 GR12 9 OTHER SPECIFY"
wc2measdiff1="R2 WC2 1 MEAS DIFF NONE"
wc2measdiff2="R2 WC2 2 MEAS DIFF DIFF BREATH"
wc2measdiff3="R2 WC2 3 MEAS DIFF NOHOLD BREATH"
wc2measdiff4="R2 WC2 4 MEAS DIFF EFFORT PAIN"
wc2measdiff5="R2 WC2 5 MEAS DIFF EFFORT OTHER"
wc2measdiff6="R2 WC2 6 MEAS DIFF LOCATE NAVEL"
wc2measdiff9="R2 WC2 9 MEAS DIFF OTHER SPECIFY"
wc2waistrslt="R2 W3 WAIST CIRCUMFRNC RESULTS"
wc2wstmsrinc="R2 W4A WAIST MEASURE INCHES"
wc2wstmsrqrt="R2 W4B WAIST MEASURE QTR INCHES"
wc2wstbulkcl="R2 WC5 BULKY CLOTHING WORN"
wc2whomeasur="R2 WC6 WHO MEASURED"
wc2wstpostn="R2 WC7 POSITION 4 WAIST MEASURE"
wc2wstnotat1="R2 WC8 1 NO WC SP FELT UNSAFE"
wc2wstnotat2="R2 WC8 2 NO WC PROXY UNSAFE"
wc2wstnotat3="R2 WC8 3 NO WC INTERVIEWR UNSAFE"
wc2wstnotat4="R2 WC8 4 NO WC SP UNABLE2UNDRSTD"
wc2wstnotat5="R2 WC8 5 NO WC SP REFUSED"
wc2wstnotat9="R2 WC8 9 NO WC OTHER SPECIFY"
pk2pkarf1pos="R2 PK2 PEAK AIR FLOW 1 POSITION"
pk2pkarfl1ef="R2 PK3 PK AIR FLW 1 EFFORT GIVEN"
pk2pkarfl1rs="R2 PK4 PEAK AIR FLOW 1 RESULT"
pk2pkarfl1rd="R2 PK5 PEAK AIR FLOW 1 READING"
pk2pk1noatt1="R2 PK6 1 PEAK NO SP FELT UNSAFE"
pk2pk1noatt2="R2 PK6 2 PEAK NO PROXY UNSAFE"
pk2pk1noatt3="R2 PK6 3 PEAK NO INTERVWR UNSAFE"
pk2pk1noatt4="R2 PK6 4 PEAK NO SP UNABL2UNDSTD"
pk2pk1noatt9="R2 PK6 9 PEAK NO OTHER SPECIFY"
pk2paf2posit="R2 PK7 PEAK AIR FLOW 2 POSITION"
pk2pkarfl2ef="R2 PK8 PEAK AIR FLW 2 EFFRT GIVN"
pk2pkarfl2rs="R2 PK9 PEAK AIR FLOW 2 RESULT"
pk2pkarfl2rd="R2 PK10 PEAK AIR FLOW 2 READING"
pk2pk2noatt1="R2 PK11 1 PEAK NO SP FELT UNSAFE"
pk2pk2noatt2="R2 PK11 2 PEAK NO PROXY UNSAFE"
pk2pk2noatt3="R2 PK11 3 PEAK NO INTRVWR UNSAFE"
pk2pk2noatt4="R2 PK11 4 PEAK NO SP UNABL2UNDST"
pk2pk2noatt9="R2 PK11 9 PEAK NO OTHER SPECIFY"
cl2endtimhrs="R2 CL1 HRS END TIME HOURS"
cl2endtimmin="R2 CL1 MINS END TIME MINUTES"
cl2endtmampm="R2 CL1 AMPM END TIME AM OR PM"
r2dnhatssppb="R2 D NHATS SPPB SCORE"
r2dnhatsbasc="R2 D NHATS BALANCE SCORE"
r2dnhatswksc="R2 D NHATS WALK SCORE"
r2dnhatschsc="R2 D NHATS REPEAT CHAIR SCORE"
r2dnhatsgrav="R2 D NHATS AVG GRIP SCORE"
r2dnhatsgrb="R2 D NHATS BEST GRIP SCORE"
r2dnhatspkav="R2 D NHATS AVG AIR FLOW SCORE"
r2dnhatspkb="R2 D NHATS BEST AIR FLOW SCORE"
r2dsppbmiss="R2 D REASON MISSING SPPB"
r2dorigsppb="R2 D ORIGINAL SPPB SCORE"
r2dorigbasc="R2 D ORIGINAL BALNCE SCORE"
r2dorigwksc="R2 D ORIGINAL WALK SCORE"
r2dorigchsc="R2 D ORIGINAL REPEAT CHAIR SCORE"
hw2currweigh="R2 HW2 YOU CURRENTLY WEIGH"
hw2lst10pnds="R2 HW4 LOST 10 POUNDS IN LAST YR"
hw2trytolose="R2 HW5 WERE YOU TRYNG LOSE WEGHT"
hw2howtallft="R2 HW7 HOW TALL ARE YOU FEET"
hw2howtallin="R2 HW8 HOW TALL ARE YOU INCHES"
el2mothalive="R2 EL11 YOUR MOTHER STILL LIVING"
el2fathalive="R2 EL12 YOUR FATHER STILL LIVING"
wb2offelche1="R2 WB1 OFTEN YOU FEEL CHEERFUL"
wb2offelche2="R2 WB1 OFTEN YOU FEEL BORED"
wb2offelche3="R2 WB1 OFTEN YOU FEEL FULLOFLIFE"
wb2offelche4="R2 WB1 OFTEN YOU FEEL UPSET"
wb2truestme1="R2 WB2 SP LIFE HAS MEANING PURPS"
wb2truestme2="R2 WB2 SP FEELS CONFIDENT"
wb2truestme3="R2 WB2 SP GAVE UP IMPROVING LIFE"
wb2truestme4="R2 WB2 SP LIKES LIVING SITUATION"
wb2ageyofeel="R2 WB3 AGE YOU FEEL MOST OF TIME"
wb2agrwstmt1="R2 WB4 SP SELF DETERMINATION"
wb2agrwstmt2="R2 WB4 SP WANTS-FINDS WAY TO DO"
wb2agrwstmt3="R2 WB4 SP ADJUSTS TO CHANGE"
ip2covmedcad="R2 IP1 COVERD BY MEDICARE PART D"
ip2otdrugcov="R2 IP2 DRUG COVERG SOME OTHR WAY"
ip2mgapmedsp="R2 IP3 MEDIGAP OR MEDICARE SUPP"
ip2cmedicaid="R2 IP4 COV BY STATE MEDICAID PRG"
ip2covtricar="R2 IP5 COVERED BY TRICARE"
ip2nginslast="R2 IP5A HAVE LTC INS FROM LAST INT"
ip2nginsnurs="R2 IP6 NONGOV INSR FOR NURS HOME"
ip2typcarco1="R2 IP7 LTC INS NURSNG HOME COVD"
ip2typcarco2="R2 IP7 LTC INS ASSISTD LVNG COVD"
ip2typcarco3="R2 IP7 LTC INS HOME HEALTH COVD"
ip2paypremms="R2 IP8 HOW MUCH PAY IN PREMIUMS"
lf2workfpay="R2 LF1 WORKED FOR PAY RECENTLY"
lf2abstlstwk="R2 LF2 ABSENT FRM JOB LAST WEEK"
lf2wrkplstmn="R2 LF3 WORK FOR PAY IN LST MONTH"
lf2mrthnonjb="R2 LF4 MOR THN ONE JOB LAST WEEK"
lf2hrswkwork="R2 LF5 HRS PR WEEK WORK MAIN JOB"
lf2hrwrkltwk="R2 LF6 HOURS WORK LAST WEEK"
lf2hrwrklstw="R2 LF7 HOW MNY HOURS DID YOU WRK"
lf2oftpaid="R2 LF8 HOW OFTN PAID ON MAIN JOB"
lf2huswifwrk="R2 LF13 HUSB WIFE PARTN PAY WORK"
lf2doccup="R2 D  CURRENT OCCUPATION CATEGORY  "
hp2ownrentot="R2 HP1 OWN RENT OR OTHER"
hp2mrtpadoff="R2 HP2 MORTGAGE PAID OFF"
hp2mthlymort="R2 HP3 MORTGAGE PAYMNT EACH MNTH"
hp2mortpaymt="R2 HP3A MORTGAGE PAYMENT AMOUNT"
hp2whnpayoff="R2 HP3B WHEN EXPCT PAY OFF MORTG"
hp2amtstlowe="R2 HP3C HOW MUCH STILL OWE"
hp2amoutowed="R2 HP3D THE AMOUNT OWED IS"
hp2homevalue="R2 HP4 PRESENT VALUE OF HOME"
hp2homvalamt="R2 HP4A HOME VALUE AMOUNT"
hp2payrent="R2 HP5 DO YOU PAY RENT"
hp2rentamt="R2 HP6 RENT PAID EACH MONTH"
hp2rentamout="R2 HP6A RENT AMOUNT"
hp2sec8pubsn="R2 HP7 HME SEC 8 PUBL SENOR HOUS"
ew2pycredbal="R2 EW1 PAY OFF CREDIT CARD BALAN"
ew2crecardeb="R2 EW2 TOTAL CREDIT CARD DEBT"
ew2credcdmed="R2 EW3 CREDIT CARD MEDICAL CARE"
ew2amtcrdmed="R2 EW4 AMT ON CARDS FOR MED CARE"
ew2medpaovtm="R2 EW5 MED BILLS PAID OVERTIME"
ew2ampadovrt="R2 EW6 AMT FOR MED BILL OVR TIME"
ew2finhlpfam="R2 EW7 FINANCIAL HELP FRM FAMILY"
ew2whohelfi1="R2 EW8 CHILD HELPED FINANCIALLY"
ew2whohelfi2="R2 EW8 OTHER HELPED FINANCIALLY"
ew2atchhelyr="R2 EW10 AMT FROM CHILDR LST YR"
ew2fingftfam="R2 EW11 FINANCIAL GIFTS TO FAMLY"
ew2whregoth1="R2 EW12 SP GAVE CHILD FINCL HLP"
ew2whregoth2="R2 EW12 SP GAVE GRANDCHD FIN HLP"
ew2whregoth3="R2 EW12 SP GAVE OTHR FINANCL HLP"
ew2amthlpgiv="R2 EW14 AMOUNT OF HELP GIVEN"
ew2progneed1="R2 EW15 SP RECEIVD FOOD STAMPS"
ew2progneed2="R2 EW15 SP REC OTHR FOOD ASST"
ew2progneed3="R2 EW15 SP REC GAS ENERGY ASST"
ew2mealskip1="R2 EW16 SKIP MEALS NO MONEY"
ew2mealskip2="R2 EW16 SKIP MEALS HOW OFTEN"
ew2nopayhous="R2 EW18 NO MONEY FOR HOUSING"
ew2nopayutil="R2 EW18 NO MONEY FOR UTILITIES"
ew2nopaymed="R2 EW18 NO MONEY FOR MEDICAL"
ad2heardif="R2 AD1 SP IS DEAF OR DIFF HEARING"
ad2seedif="R2 AD2 SP IS BLIND OR DIFF SEEING"
ad2concdif="R2 AD3 DIFF CONCENTRATE DECIDE"
ad2walkdif="R2 AD4 DIFFICULTY WALKING STAIRS"
ad2dresdif="R2 AD5 DIFFICULTY DRESS BATHE"
ad2erranddif="R2 AD6 DIFFICULTY DOING ERRANDS"
eh2advicedoc="R2 EH1 MAKE DECISION WITH DOCTOR"
eh2advicefam="R2 EH2 MAKE DECISION WITH FAMILY"
eh2medmgmt="R2 EH3 MANAGE MEDICAL CARE"
eh2meddif="R2 EH4 DIFF MANAGE MEDICAL CARE"
eh2medfamdif="R2 EH5 DIFF FAMILY MANAGE CARE"
eh2meddelay="R2 EH6 DELAY IN MANAGE MED CARE"
eh2medtoomch="R2 EH7 TOO MUCH MANAGE MED CARE"
ep2eoltalk="R2 EP1 TALK END OF LIFE CARE"
ep2eoltalk2="R2 EP2 TALK SPOUSE PARTNER "
ep2eoltalk3="R2 EP2 TALK DAUGHTER "
ep2eoltalk4="R2 EP2 TALK SON"
ep2eoltalk5="R2 EP2 TALK DAUGHTER IN LAW "
ep2eoltalk6="R2 EP2 TALK SON IN LAW "
ep2eoltalk7="R2 EP2 TALK STEPDAUGHTER "
ep2eoltalk8="R2 EP2 TALK STEPSON "
ep2eoltalk9="R2 EP2 TALK SISTER "
ep2eoltalk10="R2 EP2 TALK BROTHER "
ep2eoltalk11="R2 EP2 TALK SISTER IN LAW "
ep2eoltalk12="R2 EP2 TALK BROTHER IN LAW "
ep2eoltalk13="R2 EP2 TALK MOTHER "
ep2eoltalk14="R2 EP2 TALK STEPMOTHER "
ep2eoltalk15="R2 EP2 TALK MOTHER IN LAW "
ep2eoltalk16="R2 EP2 TALK FATHER "
ep2eoltalk17="R2 EP2 TALK STEPFATHER"
ep2eoltalk18="R2 EP2 TALK FATHER IN LAW "
ep2eoltalk19="R2 EP2 TALK GRANDDAUGHTER "
ep2eoltalk20="R2 EP2 TALK GRANDSON "
ep2eoltalk21="R2 EP2 TALK NIECE "
ep2eoltalk22="R2 EP2 TALK NEPHEW "
ep2eoltalk23="R2 EP2 TALK AUNT "
ep2eoltalk24="R2 EP2 TALK UNCLE "
ep2eoltalk25="R2 EP2 TALK COUSIN "
ep2eoltalk26="R2 EP2 TALK STEPDAUGHTER SON/DAU "
ep2eoltalk27="R2 EP2 TALK STEPSON SON/DAUGHTER"
ep2eoltalk28="R2 EP2 TALK DAUGHTER IN LAW SON/DAU"
ep2eoltalk29="R2 EP2 TALK SON IN LAW SON/DAU"
ep2eoltalk30="R2 EP2 TALK BOARDER RENTER "
ep2eoltalk31="R2 EP2 TALK PAID AIDE HSKEEP EMPLOY "
ep2eoltalk32="R2 EP2 TALK ROOMMATE  "
ep2eoltalk33="R2 EP2 TALK EX WIFE EX HUSBAND "
ep2eoltalk34="R2 EP2 TALK BOYFRIEND GIRLFRIEND "
ep2eoltalk35="R2 EP2 TALK NEIGHBOR "
ep2eoltalk36="R2 EP2 TALK FRIEND "
ep2eoltalk37="R2 EP2 TALK SERVICE PRSN PLACE SP LIV"
ep2eoltalk38="R2 EP2 TALK CO WORKER "
ep2eoltalk39="R2 EP2 TALK MINISTER CLERGY "
ep2eoltalk40="R2 EP2 TALK PSYCH COUNSELOR THERP "
ep2eoltalk91="R2 EP2 TALK OTHER RELATIVE "
ep2eoltalk92="R2 EP2 TALK OTHER NONRELATIVE"
ep2poweratty="R2 EP3 POWER OF ATTORNEY"
ep2eolpow2="R2 EP4 POW SPOUSE PARTNER "
ep2eolpow3="R2 EP4 POW DAUGHTER "
ep2eolpow4="R2 EP4 POW SON"
ep2eolpow5="R2 EP4 POW DAUGHTER IN LAW "
ep2eolpow6="R2 EP4 POW SON IN LAW "
ep2eolpow7="R2 EP4 POW STEPDAUGHTER "
ep2eolpow8="R2 EP4 POW STEPSON "
ep2eolpow9="R2 EP4 POW SISTER "
ep2eolpow10="R2 EP4 POW BROTHER "
ep2eolpow11="R2 EP4 POW SISTER IN LAW "
ep2eolpow12="R2 EP4 POW BROTHER IN LAW "
ep2eolpow13="R2 EP4 POW MOTHER "
ep2eolpow14="R2 EP4 POW STEPMOTHER "
ep2eolpow15="R2 EP4 POW MOTHER IN LAW "
ep2eolpow16="R2 EP4 POW FATHER "
ep2eolpow17="R2 EP4 POW STEPFATHER"
ep2eolpow18="R2 EP4 POW FATHER IN LAW "
ep2eolpow19="R2 EP4 POW GRANDDAUGHTER "
ep2eolpow20="R2 EP4 POW GRANDSON "
ep2eolpow21="R2 EP4 POW NIECE "
ep2eolpow22="R2 EP4 POW NEPHEW "
ep2eolpow23="R2 EP4 POW AUNT "
ep2eolpow24="R2 EP4 POW UNCLE "
ep2eolpow25="R2 EP4 POW COUSIN "
ep2eolpow26="R2 EP4 POW STEPDAUGHTER SON/DAU "
ep2eolpow27="R2 EP4 POW STEPSON SON/DAUGHTER"
ep2eolpow28="R2 EP4 POW DAUGHTER IN LAW SON/DAU"
ep2eolpow29="R2 EP4 POW SON IN LAW SON/DAU"
ep2eolpow30="R2 EP4 POW BOARDER RENTER "
ep2eolpow31="R2 EP4 POW PAID AIDE HSKEEP EMPLOY "
ep2eolpow32="R2 EP4 POW ROOMMATE  "
ep2eolpow33="R2 EP4 POW EX WIFE EX HUSBAND "
ep2eolpow34="R2 EP4 POW BOYFRIEND GIRLFRIEND "
ep2eolpow35="R2 EP4 POW NEIGHBOR "
ep2eolpow36="R2 EP4 POW FRIEND "
ep2eolpow37="R2 EP4 POW SERVICE PRSN PLACE SP LIV"
ep2eolpow38="R2 EP4 POW CO WORKER "
ep2eolpow39="R2 EP4 POW MINISTER CLERGY "
ep2eolpow40="R2 EP4 POW PSYCH COUNSELOR THERP "
ep2eolpow91="R2 EP4 POW OTHER RELATIVE "
ep2eolpow92="R2 EP4 POW OTHER NONRELATIVE"
ep2livngwill="R2 EP5 HAS LIVING WILL"
ep2paintrmnt="R2 EP6 CARE IF IN CONSTANT PAIN"
ep2talktrmnt="R2 EP7 CARE IF CANT TALK WALK"
ep2bstcre="R2 EP8A BEST CARE FOR PAT"
ep2sndbstcre="R2 EP8B SECOND BEST CARE FOR PAT"
ep2money="R2 EP9 FUTURE CARE USE MST MONEY"
ir2intlang="R2 IR1A1 INTERVIEW LANGUAGE"
ir2spattitud="R2 IR2 SP ATTITUDE TOWARD INTVW"
ir2undrstand="R2 IR3 SP UNDERSTAND QUESTION"
ir2sppresent="R2 IR4 AMT OF INTERVIW SP PRESNT"
ir2spnotprs1="R2 IR5 REASON SP NOT PRESENT_SLEEP "
ir2spnotprs2="R2 IR5 REASON SP NOT PRESENT_2ILL "
ir2spnotprs3="R2 IR5 REASON SP NOT PRESENT_ALZH "
ir2spnotprs4="R2 IR5 REASON SP NOT PRESENT_PRXYREQ "
ir2spnotprs5="R2 IR5 REASON SP NOT PRESENT_INFCLTY "
ir2spnotprs6="R2 IR5 REASON SP NOT PRESENT_OTHSPFY "
ir2intvwhlp="R2 IR6 ANYONE HELP WITH INTVW"
ir2prsnhlp1="R2 IR6A SPOUSE HELPED WITH INTVW"
ir2prsnhlp2="R2 IR6A CHILD HELPED WITH INTVW"
ir2prsnhlp3="R2 IR6A RELATIVE HELP WITH INTVW"
ir2prsnhlp4="R2 IR6A FRIEND HELPED WITH INTVW"
ir2prsnhlp5="R2 IR6A STAFF HELPED WITH INTVW"
ir2prsnhlp6="R2 IR6A AIDE HELPED WITH INTVW"
ir2prsnhlp91="R2 IR6A OTHER HELPED WITH INTVW"
ir2demolang1="R2 IR10B PHYS ACT DEMO SAFETY TRANS"
ir2strprob="R2 IR11 PROBLEMS ADMIN STROOP"
ir2sessions="R2 IR12 MORE ONE INTVW SESSION"
ir2sessrsn1="R2 IR12A MORE 1 SESSION SP TIRED"
ir2sessrsn2="R2 IR12A MORE 1 SESSION SP ILL"
ir2sessrsn3="R2 IR12A MORE 1 SESSION SCHEDULE"
ir2sessrsn91="R2 IR12A MORE 1 SESSION OTHER"
ir2conhomapt="R2 IR12C INTRV CONDTD AT HME/APT"
ir2insidhome="R2 IR12E GO INSIDE HOME/APT/UNIT"
ir2condihom1="R2 IR13 PAINT PEELING IN SP HOME"
ir2condihom2="R2 IR13 PESTS IN SP HOME"
ir2condihom3="R2 IR13 BROKN FURNITURE SP HOME"
ir2condihom4="R2 IR13 FLOORING NEEDS REPAIR"
ir2condihom5="R2 IR13 HOME OTHR TRIPPING HAZRD"
ir2clutterr1="R2 IR14 CLUTTR IN INTERVIEW ROOM"
ir2clutterr2="R2 IR14 CLUTTR IN OTHR SP ROOMS"
ir2areacond1="R2 IR15 LITTER GLASS ON SDWLK ST"
ir2areacond2="R2 IR15 GRAFFITI ON BUILDG WALLS"
ir2areacond3="R2 IR15 VACANT HOUSES OR STORES"
ir2condhome1="R2 IR16 BROKEN WINDOWS IN HOME"
ir2condhome2="R2 IR16 CRUMBLNG FOUNDTN IN HOME"
ir2condhome3="R2 IR16 MISSNG BRCKS SIDNG IN HM"
ir2condhome4="R2 IR16 ROOF PROBLEM IN HOME"
ir2condhome5="R2 IR16 BROKEN STEPS TO HOME"
ir2condhome6="R2 IR16 CONTINUOUS SIDEWALKS"
r2stroopmean="R2 STROOP MEAN OF EASY HARD TESTS"
r2strooprati="R2 STROOP RATIO OF EASY HARD TESTS"
r2stroopgrp="R2 STROOP GROUPS BY ACCURACY"
fq2dfacdescr="R2 FQ6 FACILITY TYPE"
fq2dosfacd="R2 D FQ6A OTHER SPECIFY FAC TYPE"
fq2prtlivnam="R2 FQ8 FAC NM DIFF4PLC SP LIVES"
fq2dfacarea="R2 FQ10 FACILITY AREA SP LIVES"
fq2dosfaca="R2 D FQ10A OTHER SPECIFY FAC AREA"
fq2assdnrsng="R2 FQ11 ASSIST LIV OR NURSG HOME"
fq2othrlevls="R2 FQ12 OTH LEVELS OF CARE AVAIL"
fq2whotlevl1="R2 FQ13 INDEPNDNT LIV CARE AVAIL"
fq2whotlevl2="R2 FQ13 ASSISTED LVNG CARE AVAIL"
fq2whotlevl3="R2 FQ13 ALZHEIMER CARE AVAIL"
fq2whotlevl4="R2 FQ13 NURSING HOME CARE AVAIL"
fq2whotlevl5="R2 FQ13 OTHR SPECIFY CARE AVAIL"
fq2servaval1="R2 FQ15 MEALS AVAIL"
fq2servaval2="R2 FQ15 HELP WITH MEDS AVAIL"
fq2servaval3="R2 FQ15 HELP W BATH DRESS AVAIL"
fq2servaval4="R2 FQ15 LAUNDRY SERVCS AVAIL"
fq2servaval5="R2 FQ15 HOUSEKEEPING SERV AVAIL"
fq2servaval6="R2 FQ15 TRANSPRT MED CARE PROV"
fq2servaval7="R2 FQ15 TRANSPRT TO STORE EVENT"
fq2servaval8="R2 FQ15 RECREATIONAL FAC AVAIL"
fq2servaval9="R2 FQ15 SOCIAL EVENTS AVAIL"
fq2paysourc1="R2 FQ16 SP OR SP FAMILY PAYMENT"
fq2paysourc2="R2 FQ16 SOC SEC SSI PAYMENT"
fq2paysourc3="R2 FQ16 MEDICAID PAYMENT"
fq2paysourc4="R2 FQ16 MEDICARE PAYMENT"
fq2paysourc5="R2 FQ16 PRIVATE INSURANCE PAYMNT"
fq2paysourc6="R2 FQ16 OTHR GOVT PAYMENT"
fq2totalpaym="R2 FQ17 TOTAL PAYMENT FOR CARE"
fq2mnthlyamt="R2 FQ18 TOT MTHLY AMT FOR CARE"
fq2primpayer="R2 FQ19 PRIMARY PAYER FOR CARE"
fq2govsource="R2 FQ20 GOVERNMENT SOURCE"
fq2dlocsp="R2 D FQ6 6A 10 10A FOR SAMP WGT "
w2anfinwgt0="R2 FINAL ANALYTIC WGT FULL SAMP"
w2anfinwgt1="R2 FINAL ANALYTIC WGT REP 1"
w2anfinwgt2="R2 FINAL ANALYTIC WGT REP 2"
w2anfinwgt3="R2 FINAL ANALYTIC WGT REP 3"
w2anfinwgt4="R2 FINAL ANALYTIC WGT REP 4"
w2anfinwgt5="R2 FINAL ANALYTIC WGT REP 5"
w2anfinwgt6="R2 FINAL ANALYTIC WGT REP 6"
w2anfinwgt7="R2 FINAL ANALYTIC WGT REP 7"
w2anfinwgt8="R2 FINAL ANALYTIC WGT REP 8"
w2anfinwgt9="R2 FINAL ANALYTIC WGT REP 9"
w2anfinwgt10="R2 FINAL ANALYTIC WGT REP 10"
w2anfinwgt11="R2 FINAL ANALYTIC WGT REP 11"
w2anfinwgt12="R2 FINAL ANALYTIC WGT REP 12"
w2anfinwgt13="R2 FINAL ANALYTIC WGT REP 13"
w2anfinwgt14="R2 FINAL ANALYTIC WGT REP 14"
w2anfinwgt15="R2 FINAL ANALYTIC WGT REP 15"
w2anfinwgt16="R2 FINAL ANALYTIC WGT REP 16"
w2anfinwgt17="R2 FINAL ANALYTIC WGT REP 17"
w2anfinwgt18="R2 FINAL ANALYTIC WGT REP 18"
w2anfinwgt19="R2 FINAL ANALYTIC WGT REP 19"
w2anfinwgt20="R2 FINAL ANALYTIC WGT REP 20"
w2anfinwgt21="R2 FINAL ANALYTIC WGT REP 21"
w2anfinwgt22="R2 FINAL ANALYTIC WGT REP 22"
w2anfinwgt23="R2 FINAL ANALYTIC WGT REP 23"
w2anfinwgt24="R2 FINAL ANALYTIC WGT REP 24"
w2anfinwgt25="R2 FINAL ANALYTIC WGT REP 25"
w2anfinwgt26="R2 FINAL ANALYTIC WGT REP 26"
w2anfinwgt27="R2 FINAL ANALYTIC WGT REP 27"
w2anfinwgt28="R2 FINAL ANALYTIC WGT REP 28"
w2anfinwgt29="R2 FINAL ANALYTIC WGT REP 29"
w2anfinwgt30="R2 FINAL ANALYTIC WGT REP 30"
w2anfinwgt31="R2 FINAL ANALYTIC WGT REP 31"
w2anfinwgt32="R2 FINAL ANALYTIC WGT REP 32"
w2anfinwgt33="R2 FINAL ANALYTIC WGT REP 33"
w2anfinwgt34="R2 FINAL ANALYTIC WGT REP 34"
w2anfinwgt35="R2 FINAL ANALYTIC WGT REP 35"
w2anfinwgt36="R2 FINAL ANALYTIC WGT REP 36"
w2anfinwgt37="R2 FINAL ANALYTIC WGT REP 37"
w2anfinwgt38="R2 FINAL ANALYTIC WGT REP 38"
w2anfinwgt39="R2 FINAL ANALYTIC WGT REP 39"
w2anfinwgt40="R2 FINAL ANALYTIC WGT REP 40"
w2anfinwgt41="R2 FINAL ANALYTIC WGT REP 41"
w2anfinwgt42="R2 FINAL ANALYTIC WGT REP 42"
w2anfinwgt43="R2 FINAL ANALYTIC WGT REP 43"
w2anfinwgt44="R2 FINAL ANALYTIC WGT REP 44"
w2anfinwgt45="R2 FINAL ANALYTIC WGT REP 45"
w2anfinwgt46="R2 FINAL ANALYTIC WGT REP 46"
w2anfinwgt47="R2 FINAL ANALYTIC WGT REP 47"
w2anfinwgt48="R2 FINAL ANALYTIC WGT REP 48"
w2anfinwgt49="R2 FINAL ANALYTIC WGT REP 49"
w2anfinwgt50="R2 FINAL ANALYTIC WGT REP 50"
w2anfinwgt51="R2 FINAL ANALYTIC WGT REP 51"
w2anfinwgt52="R2 FINAL ANALYTIC WGT REP 52"
w2anfinwgt53="R2 FINAL ANALYTIC WGT REP 53"
w2anfinwgt54="R2 FINAL ANALYTIC WGT REP 54"
w2anfinwgt55="R2 FINAL ANALYTIC WGT REP 55"
w2anfinwgt56="R2 FINAL ANALYTIC WGT REP 56"
w2varstrat="R2 VARIANCE ESTIMATION STRATUM"
w2varunit="R2 VARIANCE ESTIMATION CLUSTER";

run;
