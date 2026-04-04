/* NHATS_Round_1_OP_Read.SAS - Public Use - */

/* Section #1 - Creating the Formats */
proc format;
VALUE  dmissadd
        1 =  ' 1 no flags and added at CL section'
        2 =  ' 2 no flags and added at DT section'
        3 =  ' 3 no flags and added at EW section'
        4 =  ' 4 no flags and added at HA section'
        5 =  ' 5 no flags and added at HO section'
        6 =  ' 6 no flags and added at MC section'
        7 =  ' 7 no flags and added at MO section'
        8 =  ' 8 no flags and added at PA section'
        9 = '9 no flags and added at PE section'
        10 = '10 no flags and added at SC section'
        11 = '11 no flags and added at SN section'
        -1 = '-1 not applicable';

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
    VALUE DOPAGE3C
        1  = '1- UNDER 30'
        2  = '2- 30-39'
        3  = '3- 40-49'
        4  = '4- 50-59'
        5  = '5- 60-69'
        6  = '6- 70-79'
        7  = '7- 80-89'
        8  = '8- 90 +'
       -7 = '-7 - DK'
       -8 = '-8 - RF'
       -1 = '-1 - Inapplicable'
       -9 = '-9 - Missing';
    VALUE DOPAGECT
     -7 = '-7 - DK'
     -8 = '-8 - RF'
     -1 = '-1 - Inapplicable'
     -9 = '-9 - Missing'
      1 = " 1 - UNDER 20"
      2 = " 2 - 20-24"
      3 = " 3 - 25-29"
      4 = " 4 - 30-34"
      5 = " 5 - 35-39"
      6 = " 6 - 40-44"
      7 = " 7 - 45-49"
      8 = " 8 - 50-54"
      9 = " 9 - 55-59"
     10 = "10 - 60-64"
     11 = "11 - 65-69"
     12 = "12 - 70-74"
     13 = "13 - 75-79"
     14 = "14 - 80-84"
     15 = "15 - 85-89"
     16 = "16 - 90 +";
    VALUE W000002W
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing'
     1 = " 1 MALE"
     2 = " 2 FEMALE"    ;

     VALUE W000005W
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing'
     1 = " 1 YES"
     2 = " 2 NO"    ;

    VALUE W000009W
       1 = " 1 SAMPLE PERSON"
       2 = " 2 SPOUSE/ PARTNER"
       3 = " 3 DAUGHTER"
       4 = " 4 SON"
       5 = " 5 DAUGHTER-IN-LAW"
       6 = " 6 SON-IN-LAW"
       7 = " 7 STEPDAUGHTER"
       8 = " 8 STEPSON"
       9 = " 9 SISTER"
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
      37 = "37 STAFF PERSON AT THE PLACE SP LIVES"
      38 = "38 CO-WORKER"
      39 = "39 MINISTER, PRIEST, OR OTHER CLERGY"
      40 = "40 PSYCHIATRIST, PSYCHOLOGIST, COUNSELOR, OR THERAPIST"
      91 = "91 OTHER RELATIVE"
      92 = "92 OTHER NONRELATIVE"    ;

    VALUE W000010W
      1 = " 1 MARRIED"
      2 = " 2 LIVING WITH A PARTNER"
      3 = " 3 SEPARATED"
      4 = " 4 DIVORCED"
      5 = " 5 WIDOWED"
      6 = " 6 NEVER MARRIED"
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 INAPPLICABLE'
     -9 = '-9 MISSING';
    VALUE W000012W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 NO SCHOOLING COMPLETED"
      2 = " 2 1ST-8TH GRADE"
      3 = " 3 9TH-12TH GRADE (NO DIPLOMA)"
      4 = " 4 HIGH SCHOOL GRADUATE (HIGH SCHOOL DIPLOMA OR EQUIVALENT)"
      5 = " 5 VOCATIONAL, TECHNICAL, BUSINESS, OR TRADE SCHOOL CERTIFICATE OR DIPLOMA (BEYOND HIGH SCHOOL LEVEL)"
      6 = " 6 SOME COLLEGE BUT NO DEGREE"
      7 = " 7 ASSOCIATE'S DEGREE"
      8 = " 8 BACHELOR'S DEGREE"
      9 = " 9 MASTER'S, PROFESSIONAL, OR DOCTORAL DEGREE";
    VALUE W000013W
      1 = " 1 REGULAR"
      2 = " 2 VARIED"
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 INAPPLICABLE'
     -9 = '-9 MISSING'    ;
    VALUE W000015W
      1 = " 1 HOURLY"
      2 = " 2 WEEKLY"
      3 = " 3 MONTHLY"
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 INAPPLICABLE'
     -9 = '-9 MISSING'    ;
    VALUE W000016W
      1 = " 1 MEDICAID"
      2 = " 2 MEDICARE"
      3 = " 3 STATE PROGRAM"
     91 = "91 OTHER (SPECIFY)"
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 INAPPLICABLE'
     -9 = '-9 MISSING'    ;
run;
/* Section #2 - Input statement with variable name and location on the .txt file  
		Reminder - change [PATH] to reflect your file locations       */

Data opfile;
INFILE  "[PATH]\NHATS_Round_1_OP_File_v2.txt"

LRECL=154 ;
INPUT @1 spid 8.
@9 opid $3.
@12 op1proxy 2.
@14 op1relatnshp 2.
@16 op1gender 2.
@18 op1spouprtnr 2.
@20 op1leveledu 2.
@22 op1prsninhh 2.
@24 op1childinhh 2.
@26 op1dage 2.
@28 op1chnotinhh 2.
@30 op1martlstat 2.
@32 op1numchldrn 2.
@34 op1anychdu18 2.
@36 op1numchdu18 2.
@38 op1soclntwrk 2.
@40 op1dcatgryag 2.
@42 op1dsocwrkfl 2.
@44 op1outhlp 2.
@46 op1insdhlp 2.
@48 op1bedhlp 2.
@50 op1tkplhlp1 2.
@52 op1tkplhlp2 2.
@54 op1launhlp 2.
@56 op1shophlp 2.
@58 op1mealhlp 2.
@60 op1bankhlp 2.
@62 op1moneyhlp 2.
@64 op1eathlp 2.
@66 op1bathhlp 2.
@68 op1toilhlp 2.
@70 op1dreshlp 2.
@72 op1medshlp 2.
@74 op1dochlp 2.
@76 op1dochlpmst 2.
@78 op1insurhlp 2.
@80 op1spcaredfr 2.
@82 op1chhlpfin 2.
@84 op1hlpchfin 2.
@86 op1ishelper 2.
@88 op1helpsched 2.
@90 op1numdayswk 2.
@92 op1numdaysmn 2.
@94 op1numhrsday 2.
@96 op1paidhelpr 2.
@98 op1sppayshlp 2.
@100 op1govpayhlp 2.
@102 op1inspayhlp 2.
@104 op1othpayhlp 2.
@106 op1payunit 2.
@108 op1hourlypay 8.2
@116 op1weeklypay 8.
@124 op1monthlypy 8.
@132 op1progmpaid 8.
@140 op1dhrsmth 4.
@144 op1contctflg 2.
@146 op1dflmiss 2.
@148 op1dmissadd 2.
@150 op1dprobdup 2.
@152 op1ddupeid $ 3.
;

/* Section #3 - format assignment statement   */
format op1proxy RFDK_Y.
op1relatnshp W000009W.
op1gender W000002W.
op1spouprtnr RFDK_Y.
op1leveledu W000012W.
op1prsninhh W000005W.
op1childinhh RFDK_Y.
op1dage DOPAGECT.
op1chnotinhh RFDK_Y.
op1martlstat W000010W.
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
op1helpsched W000013W.
op1numdayswk RFDK_F.
op1numdaysmn RFDK_F.
op1numhrsday RFDK_F.
op1paidhelpr RFDK_YN.
op1sppayshlp RFDK_YN.
op1govpayhlp RFDK_YN.
op1inspayhlp RFDK_YN.
op1othpayhlp RFDK_YN.
op1payunit W000015W.
op1hourlypay RFDK_F.
op1weeklypay RFDK_F.
op1monthlypy RFDK_F.
op1progmpaid W000016W.
op1dhrsmth HOURSF.
op1contctflg RFDK_YN.
op1dflmiss RFDK_Y.
op1dmissadd DMISSADD.
op1dprobdup RFDK_Y.
;
/* Section #4 - Label assignment statement   */
label
spid ="NHATS SAMPLED PERSON ID"
opid ="OTHER PERSON ID"
op1proxy ="R1 IS2 PROXY"
op1relatnshp ="R1 OTHR PRSN RELATIONSHIP TO SP"
op1gender ="R1 OTHER PERSON GENDER"
op1spouprtnr ="R1 BXHH4A SPOUSE PARTNER"
op1leveledu ="R1 OP HIGHEST LEVEL EDUCATION"
op1prsninhh ="R1 OTHER PRSN IN HOUSEHOLD"
op1childinhh ="R1 HH15 CHILD IN HOUSEHOLD"
op1dage ="R1 D OTH PERSN CAT AGE AT INTVW"
op1chnotinhh ="R1 CS2 CHILD NOT IN HOUSEHOLD"
op1martlstat ="R1 OTHER PERSON MARITAL STATUS"
op1numchldrn ="R1 OTHER PRSN NUMBER OF CHILDREN"
op1anychdu18 ="R1 OTH PRS ANY CHILDREN UNDER 18"
op1numchdu18 ="R1 OTH PR NUMBER OF CHILDREN U18"
op1soclntwrk ="R1 SN2 PART OF SP SOCIAL NETWORK"
op1dcatgryag ="R1 D OTH PERSN SN CAT AGE"
op1dsocwrkfl ="R1 D LIKELY SOCIAL NETWRK MEMBER"
op1outhlp ="R1 MO6A HELPS SP GO OUTSIDE"
op1insdhlp ="R1 MO19A HELPS SP INSIDE HOUSE"
op1bedhlp ="R1 MO25A HELPS SP OUT OF BED"
op1tkplhlp1 ="R1 DT5A TAKES SP PLACES MOST"
op1tkplhlp2 ="R1 DT7A TAKES SP PLACES OTH"
op1launhlp ="R1 HA3A HELPS SP WITH LAUNDRY"
op1shophlp ="R1 HA25A HELPS SP WITH SHOPPING"
op1mealhlp ="R1 HA32A HELPS SP WITH MEALS"
op1bankhlp ="R1 HA42A HELPS SP WITH BANKING"
op1moneyhlp ="R1 HA52A HELPS SP WITH MONEY"
op1eathlp ="R1 SC3A HELPS SP WITH EATING"
op1bathhlp ="R1 SC11A HELPS SP WITH BATHING"
op1toilhlp ="R1 SC17A HELPS SP WITH TOILETING"
op1dreshlp ="R1 SC23A HELPS SP WITH DRESSING"
op1medshlp ="R1 MC5A HELPS SP WITH MEDICINES"
op1dochlp ="R1 MC17A SITS IN W SP AT DRS"
op1dochlpmst ="R1 MC18 SITS MOST IF MORE THAN 1"
op1insurhlp ="R1 MC22A HELPS WITH INSUR DECIS"
op1spcaredfr ="R1 PA22D SP CARED FOR PERSON"
op1chhlpfin ="R1 EW9 CHILDREN WHO HELP FINANCE"
op1hlpchfin ="R1 EW13 HELPED CHILDREN FINANCE"
op1ishelper ="R1 BXHL1 HELPS SP"
op1helpsched ="R1 HL1 HELP IS REG SCHEDULED"
op1numdayswk ="R1 HL2 NUM DAYS HELP PER WK"
op1numdaysmn ="R1 HL3 NUM DAYS HELP PER MON"
op1numhrsday ="R1 HL4 NUM HRS HELP PER DAY"
op1paidhelpr ="R1 HL5 HELPER IS PAID"
op1sppayshlp ="R1 HL6 SP PAYS FOR HELP"
op1govpayhlp ="R1 HL6 GOVT PAYS FOR HELP"
op1inspayhlp ="R1 HL6 INSUR PAYS FOR HELP"
op1othpayhlp ="R1 HL6 OTHER PAYS FOR HELP"
op1payunit ="R1 HL7 PAYMENT UNIT"
op1hourlypay ="R1 HL7A HOURLY AMOUNT PAID"
op1weeklypay ="R1 HL7B WEEKLY AMOUNT PAID"
op1monthlypy ="R1 HL7C MONTHLY AMOUNT PAID"
op1progmpaid ="R1 HL8 PROGRAM PAID FOR HELPER"
op1dhrsmth ="R1 D HL2 HL3 HL4 HRS HELP MONTH"
op1contctflg ="R1 PERSON IS LISTED AS CONTACT"
op1dflmiss ="R1 D NO FLAGS SET FOR PERSON"
op1dmissadd ="R1 D WHERE NO FLAGS PERSN ADDED"
op1dprobdup ="R1 D OTH PERSN PROBABLE DUPLICAT"
op1ddupeid ="R1 D POSSIBLE DUPLICATE OF ID"
;

run;

