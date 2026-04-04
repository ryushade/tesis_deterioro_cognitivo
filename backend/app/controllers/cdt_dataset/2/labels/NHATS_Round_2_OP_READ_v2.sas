/* NHATS_Round_2_Read_OP_v2.SAS  - Public Use - */

/* Section #1 - Creating the Formats */
Proc format;
    VALUE CHILDDEC
    1 =  '1 CHILD DECEASED'
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';


  VALUE d2hrsmth
    -13= '-13 Deceased '
    -12= '-12 Zero days/wk'
    -11= '-11 Hours missing'
    -10= '-10 Days missing'
    -9 = ' -9 Days and hrs missing'
    -1 = ' -1 Inapplicable'
    -7 = ' -7 RF'
    -8 = ' -8 DK'
     0-<1  ='<1'
     1-<10 =' 1-<10'
    10-<20 ='10-<20'
    20-<30 ='20-<30'
    30-<40 ='30-<40'
    40-<60 ='40-<60'
    60-<120 ='60-<120'
    120-<180='120-<180'
    180-744='180-744 (24/7)'
     9999='9999 Not codeable, <1 hour/day' ;

  VALUE dhrsmth
    -11= '-11:hours missing'
    -10= '-10:days missing'
    -9 = '-9:days and hrs missing'
    -1 = '-1 Inapplicable'
    -7 = '-7 RF'
    -8 = '-8 DK'
     0-<1  ='<1'
     1-<10 =' 1-<10'
    10-<20 ='10-<20'
    20-<30 ='20-<30'
    30-<40 ='30-<40'
    40-<60 ='40-<60'
    60-<120 ='60-<120'
    120-<180='120-<180'
    180-744='180-744 (24/7)'
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
 0='0 no flags and added at undetermined section'
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
 -9='-9 Missing'
 -8='-8 RF'
 -7='-7 DK'
 -1='-1 Inapplicable'
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

    VALUE FQ_4F
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
          1='1 YES'
          2='2 NO';

Value Hoursf
 -12='-12 valid skip/staff'
 -11='-11 hours missing'
 -10='-10 days missing'
  -9='-9 days+hrs missing'
  -1='-1 Inapplicable'
 0-  1='0-<1'
 1.01- 10='1-<10'
10.01- 20='10-<20'
20.01- 30='20-<30'
30.01-40='30-<40'
40.01-60='40-<60'
60.01-120='60-<120'
120.01-180='120-<180'
180.01-744='180-744 (24/7)'
9999='9999 Not codeable, <1 hour/day';

    VALUE RFDK_F
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

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

VALUE $RFDK_F
    '-7' = '-7 RF'
    '-8' = '-8 DK'
    '-1' = '-1 Inapplicable'
    '-9' = '-9 Missing'   ;

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
    6 = "6 NEVER MARRIED"  ;

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

	VALUE W200012W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 REGULAR"
    2 = "2 VARIED"  ;

  VALUE W200030W
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'
    1 = "1 SAMPLE PERSON (SP)"
    2 = "2 PROXY"  ;

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

     VALUE f_dresid
        1 = '1 Community '
        2 = '2 Residential care not nursing home (SP interview)'
        3 = '3 Residential care not nursing home (FQ only)'
        4 = '4 Nursing home (SP interview)'
        5 = '5 Nursing home (FQ only)'
        6 = '6 Deceased'
        7 = '7 Residential care not nursing home in R1 and R2 (FQ only)'
        8 = '8 Nursing home in R1 and R2 (FQ only)' ;

	VALUE R1DRESID
     1 = '1 Community '
     2 = '2 Residential Care Resident not nursing home (SP interview complete)'
     3 = '3 Residential Care Resident not nursing home (FQ only)'
     4 = '4 Nursing Home Resident';

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
run;

/* OP DATA */
/* Section #2 - Input statement with variable name and location on the .txt file  */

Data OP_Public;
    INFILE  "[PATH]\NHATS_Round_2_OP_File_v2.txt" 
    lrecl=346;
input 
@1 spid 8.
@9 opid $3.
@12 opround 2.
@14 r2dresid 2.
@16 r1dresid 2.
@18 op2proxy 2.
@20 op2relatnshp 2.
@22 op2drelatfl 2.
@24 op2dgender 2.
@26 op2prsninhh 2.
@28 op2dage 2.
@30 op2dagefl 2.
@32 op2dgenderfl 2.
@34 op2spouprtnr 2.
@36 op2nwspouprt 2.
@38 op2eduspo 2.
@40 op2leveledu 2.
@42 op2childinhh 2.
@44 op2reasgone 2.
@46 op2dspoudec 2.
@48 op2ddeceased 2.
@50 op2chnotinhh 2.
@52 op2educhild 2.
@54 op2martlstat 2.
@56 op2numchldrn 2.
@58 op2anychdu18 2.
@60 op2numchdu18 2.
@62 op2dchilddec 2.
@64 op2soclntwrk 2.
@68 op2dsocwrkfl 2.
@70 op2outhlp 2.
@72 op2insdhlp 2.
@74 op2bedhlp 2.
@76 op2tkplhlp1 2.
@78 op2tkplhlp2 2.
@80 op2launhlp 2.
@82 op2shophlp 2.
@84 op2mealhlp 2.
@86 op2bankhlp 2.
@88 op2moneyhlp 2.
@90 op2eathlp 2.
@92 op2bathhlp 2.
@94 op2toilhlp 2.
@96 op2dreshlp 2.
@98 op2medshlp 2.
@100 op2dochlp 2.
@102 op2dochlpmst 2.
@104 op2insurhlp 2.
@106 op2spcaredfr 2.
@108 op2chhlpfin 2.
@110 op2hlpchfin 2.
@112 op2ishelper 2.
@114 op2helpsched 2.
@116 op2numdayswk 2.
@118 op2numdaysmn 2.
@120 op2numhrsday 2.
@122 op2paidhelpr 2.
@124 op2sppayshlp 2.
@126 op2govpayhlp 2.
@128 op2inspayhlp 2.
@130 op2othpayhlp 2.
@132 op2payunit 8.
@140 op2hourlypay 8.2
@148 op2weeklypay 8.
@156 op2monthlypy 8.
@164 op2progmpaid 8.
@172 op2dhrsmth 8.2
@180 op2contctflg 2.
@182 op2dflmiss 2.
@184 op2dmissadd 2.
@186 op2dprobdup 2.
@188 op2ddupeid $3.
@191 op2ddiffop 2.
@193 op1proxy 2.
@195 op1relatnshp 2.
@197 op1gender 2.
@199 op1spouprtnr 2.
@201 op1leveledu 2.
@203 op1prsninhh 2.
@205 op1childinhh 2.
@207 op1dage 2.
@209 op1chnotinhh 2.
@211 op1martlstat 2.
@213 op1numchldrn 2.
@215 op1anychdu18 2.
@217 op1numchdu18 2.
@219 op1soclntwrk 2.
@221 op1dcatgryag 2.
@223 op1dsocwrkfl 2.
@225 op1outhlp 2.
@227 op1insdhlp 2.
@229 op1bedhlp 2.
@231 op1tkplhlp1 2.
@233 op1tkplhlp2 2.
@235 op1launhlp 2.
@237 op1shophlp 2.
@239 op1mealhlp 2.
@241 op1bankhlp 2.
@243 op1moneyhlp 2.
@245 op1eathlp 2.
@247 op1bathhlp 2.
@249 op1toilhlp 2.
@251 op1dreshlp 2.
@253 op1medshlp 2.
@255 op1dochlp 2.
@257 op1dochlpmst 2.
@259 op1insurhlp 2.
@261 op1spcaredfr 2.
@263 op1chhlpfin 2.
@265 op1hlpchfin 2.
@267 op1ishelper 2.
@269 op1helpsched 3.
@272 op1numdayswk 2.
@274 op1numdaysmn 2.
@276 op1numhrsday 2.
@278 op1paidhelpr 2.
@280 op1sppayshlp 2.
@282 op1govpayhlp 2.
@284 op1inspayhlp 2.
@286 op1othpayhlp 2.
@288 op1payunit 8.
@296 op1hourlypay 8.2
@304 op1weeklypay 8.
@312 op1monthlypy 8.
@320 op1progmpaid 8.
@328 op1dhrsmth 8.2
@336 op1contctflg 2.
@338 op1dflmiss 2.
@340 op1dmissadd 2.
@342 op1dprobdup 2.
@344 op1ddupeid $3.;

/* Section #3 - format assignment statement   */
format  spid 8.
opid $3.
opround 3.
r2dresid F_DRESID.
r1dresid R1DRESID.
op2proxy FQ_4F.
op2relatnshp W200009W.
op2drelatfl RFDK_Y.
op2dgender W000002W.
op2prsninhh FQ_4F.
op2dage W200008X.
op2dagefl RFDK_Y.
op2dgenderfl RFDK_Y.
op2spouprtnr FQ_4F.
op2nwspouprt RFDK_Y.
op2eduspo W200005W.
op2leveledu W200005W.
op2childinhh FQ_4F.
op2reasgone W200061W.
op2dspoudec RFDK_Y.
op2ddeceased RFDK_Y.
op2chnotinhh RFDK_Y.
op2educhild W200005W.
op2martlstat W200010W.
op2numchldrn RFDK_F.
op2anychdu18 RFDK_YN.
op2numchdu18 RFDK_F.
op2dchilddec CHILDDEC.
op2soclntwrk FQ_4F.
op2dsocwrkfl RFDK_Y.
op2outhlp FQ_4F.
op2insdhlp FQ_4F.
op2bedhlp FQ_4F.
op2tkplhlp1 FQ_4F.
op2tkplhlp2 FQ_4F.
op2launhlp FQ_4F.
op2shophlp FQ_4F.
op2mealhlp FQ_4F.
op2bankhlp FQ_4F.
op2moneyhlp FQ_4F.
op2eathlp FQ_4F.
op2bathhlp FQ_4F.
op2toilhlp FQ_4F.
op2dreshlp FQ_4F.
op2medshlp FQ_4F.
op2dochlp FQ_4F.
op2dochlpmst FQ_4F.
op2insurhlp FQ_4F.
op2spcaredfr FQ_4F.
op2chhlpfin RFDK_Y.
op2hlpchfin RFDK_Y.
op2ishelper FQ_4F.
op2helpsched W200012W.
op2numdayswk RFDK_F.
op2numdaysmn RFDK_F.
op2numhrsday RFDK_F.
op2paidhelpr RFDK_YN.
op2sppayshlp FQ_4F.
op2govpayhlp FQ_4F.
op2inspayhlp FQ_4F.
op2othpayhlp FQ_4F.
op2payunit W200015W.
op2hourlypay RFDK_F.
op2weeklypay RFDK_F.
op2monthlypy RFDK_F.
op2progmpaid W200016W.
op2dhrsmth D2HRSMTH.
op2contctflg FQ_4F.
op2dflmiss RFDK_Y.
op2dmissadd D2MSSADD.
op2dprobdup RFDK_Y.
op2ddupeid $RFDK_F.
op2ddiffop RFDK_Y.
op1proxy RFDK_Y.
op1relatnshp W200009W.
op1gender W000002W.
op1spouprtnr RFDK_Y.
op1leveledu W200005W.
op1prsninhh W000005W.
op1childinhh RFDK_YN.
op1dage DOPAGECT.
op1chnotinhh RFDK_Y.
op1martlstat W200010W.
op1numchldrn RFDK_F.
op1anychdu18 RFDK_YN.
op1numchdu18 RFDK_F.
op1soclntwrk RFDK_Y.
op1dcatgryag DOPAGE3C.
op1dsocwrkfl RFDK_Y.
op1outhlp RFDK_Y.
op1insdhlp RFDK_Y.
op1bedhlp RFDK_Y.
op1tkplhlp1 RFDK_Y.
op1tkplhlp2 RFDK_Y.
op1launhlp RFDK_Y.
op1shophlp RFDK_Y.
op1mealhlp RFDK_Y.
op1bankhlp RFDK_Y.
op1moneyhlp RFDK_Y.
op1eathlp RFDK_Y.
op1bathhlp RFDK_Y.
op1toilhlp RFDK_Y.
op1dreshlp RFDK_Y.
op1medshlp RFDK_Y.
op1dochlp RFDK_Y.
op1dochlpmst RFDK_Y.
op1insurhlp RFDK_Y.
op1spcaredfr RFDK_Y.
op1chhlpfin RFDK_Y.
op1hlpchfin RFDK_Y.
op1ishelper RFDK_Y.
op1helpsched W200012W.
op1numdayswk RFDK_F.
op1numdaysmn RFDK_F.
op1numhrsday RFDK_F.
op1paidhelpr RFDK_YN.
op1sppayshlp RFDK_YN.
op1govpayhlp RFDK_YN.
op1inspayhlp RFDK_YN.
op1othpayhlp RFDK_YN.
op1payunit W200015W.
op1hourlypay RFDK_F.
op1weeklypay RFDK_F.
op1monthlypy RFDK_F.
op1progmpaid W200016W.
op1dhrsmth HOURSF.
op1contctflg RFDK_YN.
op1dflmiss RFDK_Y.
op1dmissadd DMISSADD.
op1dprobdup RFDK_Y.
op1ddupeid $RFDK_F.
 ;

	/* Section #4 - Label assignment statement   */
LABEL spid='NHATS SAMPLED PERSON ID'
opid='OTHER PERSON ID'
opround='ROUND OTHER PERSON ADDED'
r2dresid='R2 D RESIDENTIAL CARE STATUS'
r1dresid='R1 D RESIDENTIAL CARE STATUS'
op2proxy='R2 IS2 PROXY'
op2relatnshp='R2 RELASHIP TO SP UPDATE AND NEW'
op2drelatfl='R2 D RELATIONSHIP TO SP CORRECTED R2'
op2dgender='R2 D GENDER UPDATE AND NEW'
op2prsninhh='R2 OP IN HOUSEHOLD UPDATE AND NEW'
op2dage='R2 D OP CAT AGE UPDATE AND NEW'
op2dagefl='R2 D OP AGE CORRECTED R2'
op2dgenderfl='R2 D GENDER CORRECTED'
op2spouprtnr='R2 SPOUSE PARTNER'
op2nwspouprt='R2 NEW SPOUSE PARTNER THIS ROUND'
op2eduspo='R2 HH9 SPOU PART EDUC WHEN ADDED'
op2leveledu='R2 OP HIGHEST ED WHEN ADDED'
op2childinhh='R2 CHILD IN HOUSEHOLD UPDATE AND NEW'
op2reasgone='R2 HH13E REASON GONE FROM HH'
op2dspoudec='R2 D SPOUSE DIED'
op2ddeceased='R2 D SPOUSE CHILD HH MEMBER DIED'
op2chnotinhh='R2 CHILD NOT HOUSEHOLD UPDATE AND NEW'
op2educhild='R2 HH9 CHILD EDUC WHEN ADDED'
op2martlstat='R2 CHILD MARITL STAT WHEN ADDED'
op2numchldrn='R2 CHILD NUM CHILDRN WHEN ADDED'
op2anychdu18='R2 CHILD CHILD U 18 WHEN ADDED'
op2numchdu18='R2 CHILD NUM CHILD U 18 WHEN ADDED'
op2dchilddec='R2 D CHILD NOT IN HH DIED'
op2soclntwrk='R2 SN2 PART OF SP SOCIAL NETWORK'
op2dsocwrkfl='R2 D LIKELY SOCIAL NETWRK MEMBER'
op2outhlp='R2 MO6A HELPS SP GO OUTSIDE'
op2insdhlp='R2 MO19A HELPS SP INSIDE HOUSE'
op2bedhlp='R2 MO25A HELPS SP OUT OF BED'
op2tkplhlp1='R2 DT5A TAKES SP PLACES MOST'
op2tkplhlp2='R2 DT7A TAKES SP PLACES OTH'
op2launhlp='R2 HA3A HELPS SP WITH LAUNDRY'
op2shophlp='R2 HA25A HELPS SP WITH SHOPPING'
op2mealhlp='R2 HA32A HELPS SP WITH MEALS'
op2bankhlp='R2 HA42A HELPS SP WITH BANKING'
op2moneyhlp='R2 HA52A HELPS SP WITH MONEY'
op2eathlp='R2 SC3A HELPS SP WITH EATING'
op2bathhlp='R2 SC11A HELPS SP WITH BATHING'
op2toilhlp='R2 SC17A HELPS SP WITH TOILETING'
op2dreshlp='R2 SC23A HELPS SP WITH DRESSING'
op2medshlp='R2 MC5A HELPS SP WITH MEDICINES'
op2dochlp='R2 MC17A SITS IN W SP AT DRS'
op2dochlpmst='R2 MC18 SITS MOST IF MORE THAN 1'
op2insurhlp='R2 MC22A HELPS WITH INSUR DECIS'
op2spcaredfr='R2 PA22D SP CARED FOR PERSON'
op2chhlpfin='R2 EW9 CHILDREN WHO HELP FINANCE'
op2hlpchfin='R2 EW13 HELPED CHILDREN FINANCE'
op2ishelper='R2 BXHL2 ELIGIBLE HL SECTION'
op2helpsched='R2 HL1 HELP IS REG SCHEDULED'
op2numdayswk='R2 HL2 NUM DAYS HELP PER WK'
op2numdaysmn='R2 HL3 NUM DAYS HELP PER MON'
op2numhrsday='R2 HL4 NUM HRS HELP PER DAY'
op2paidhelpr='R2 HL5 HELPER IS PAID'
op2sppayshlp='R2 HL6 SP PAYS FOR HELP'
op2govpayhlp='R2 HL6 GOVT PAYS FOR HELP'
op2inspayhlp='R2 HL6 INSUR PAYS FOR HELP'
op2othpayhlp='R2 HL6 OTHER PAYS FOR HELP'
op2payunit='R2 HL7 PAYMENT UNIT'
op2hourlypay='R2 HL7A HOURLY AMOUNT PAID'
op2weeklypay='R2 HL7B WEEKLY AMOUNT PAID'
op2monthlypy='R2 HL7C MONTHLY AMOUNT PAID'
op2progmpaid='R2 HL8 PROGRAM PAID FOR HELPER'
op2dhrsmth='R2 D HL2 HL3 HL4 HRS HELP MONTH'
op2contctflg='R2 PERSON IS LISTED AS CONTACT'
op2dflmiss='R2 D NO FLAGS SET FOR PERSON'
op2dmissadd ='R2 D WHERE NO FLAGS PERSN ADDED'
op2dprobdup ='R2 D OTH PERSN PROBABLE DUPLICAT'
op2ddupeid='R2 D POSSIBLE DUPLICATE OF ID'
op2ddiffop='R2 D SAME R1 OPID BUT DIFF PRSN'
op1proxy='R1 IS2 PROXY'
op1relatnshp='R1 OTHR PRSN RELATIONSHIP TO SP'
op1gender='R1 OTHER PERSON GENDER'
op1spouprtnr='R1 BXHH4A SPOUSE PARTNER'
op1leveledu='R1 OP HIGHEST LEVEL EDUCATION'
op1prsninhh='R1 OTHER PRSN IN HOUSEHOLD'
op1childinhh='R1 HH15 CHILD IN HOUSEHOLD'
op1dage='R1 D OTH PERSN CAT AGE AT INTVW'
op1chnotinhh='R1 CS2 CHILD NOT IN HOUSEHOLD'
op1martlstat='R1 OTHER PERSON MARITAL STATUS'
op1numchldrn='R1 OTHER PRSN NUMBER OF CHILDREN'
op1anychdu18='R1 OTH PRS ANY CHILDREN UNDER 18'
op1numchdu18='R1 OTH PR NUMBER OF CHILDREN U18'
op1soclntwrk='R1 SN2 PART OF SP SOCIAL NETWORK'
op1dcatgryag='R1 D OTH PERSN SN CAT AGE'
op1dsocwrkfl='R1 D LIKELY SOCIAL NETWRK MEMBER'
op1outhlp='R1 MO6A HELPS SP GO OUTSIDE'
op1insdhlp='R1 MO19A HELPS SP INSIDE HOUSE'
op1bedhlp='R1 MO25A HELPS SP OUT OF BED'
op1tkplhlp1='R1 DT5A TAKES SP PLACES MOST'
op1tkplhlp2='R1 DT7A TAKES SP PLACES OTH'
op1launhlp='R1 HA3A HELPS SP WITH LAUNDRY'
op1shophlp='R1 HA3A HELPS SP WITH SHOPPING'
op1mealhlp='R1 HA32A HELPS SP WITH MEALS'
op1bankhlp='R1 HA42A HELPS SP WITH BANKING'
op1moneyhlp='R1 HA 52A HELPS SP WITH MONEY'
op1eathlp='R1 SC3A HELPS SP WITH EATING'
op1bathhlp='R1 SC11A HELPS SP WITH BATHING'
op1toilhlp='R1 SC17A HELPS SP WITH TOILETING'
op1dreshlp='R1 SC23A HELPS SP WITH DRESSING'
op1medshlp='R1 MC5A HELPS SP WITH MEDICINES'
op1dochlp='R1 MC17A SITS IN W SP AT DRS'
op1dochlpmst='R1 MC18 SITS MOST IF MORE THAN 1'
op1insurhlp='R1 MC22A HELPS WITH INSUR DECIS'
op1spcaredfr='R1 PA22D SP CARED FOR PERSON'
op1chhlpfin='R1 EW9 CHILDREN WHO HELP FINANCE '
op1hlpchfin='R1 EW13 HELPED CHILDREN FINANCE '
op1ishelper='R1 BXHL1 HELPS SP'
op1helpsched='R1 HL1 HELP IS REG SCHEDULED'
op1numdayswk='R1 HL2 NUM DAYS HELP PER WK'
op1numdaysmn='R1 HL3 NUM DAYS HELPS PER MON'
op1numhrsday='R1 HL4 NUM HRS HELPS PER DAY'
op1paidhelpr='R1 HL5 HELPER IS PAID'
op1sppayshlp='R1 HL6 SP PAYS FOR HELP'
op1govpayhlp='R1 HL6 GOVT PAYS FOR HELP'
op1inspayhlp='R1 HL6 INSUR PAYS FOR HELP'
op1othpayhlp='R1 HL6 OTHER PAYS FOR HELP'
op1payunit='R1 HL7 PAYMENT UNIT'
op1hourlypay='R1 HL7A HOURLY AMOUNT PAID'
op1weeklypay='R1 HL7B WEEKLY AMOUNT PAID'
op1monthlypy='R1 HL7C MONTHLY AMOUNT PAID'
op1progmpaid='R1 HL8 PROGRAM PAID FOR HELPER'
op1dhrsmth='R1 D HL2 HL3 HL4 HRS HELP MONTH'
op1contctflg='R1 PERSON LISTED AS CONTACT'
op1dflmiss='R1 D NO FLAGS SET FOR PERSON'
op1dmissadd='R1 D WHERE NO FLAGS PERSN ADDED'
op1dprobdup='R1 D OTH PERSN PROBABLE DUPLICAT'
op1ddupeid='R1 D POSSIBLE DUPLICATE OF ID';

run;

