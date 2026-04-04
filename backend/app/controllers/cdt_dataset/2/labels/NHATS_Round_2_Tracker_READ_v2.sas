/* NHATS_Round_2_Tracker_Read_v2.SAS - Public Use */

/* Section #1 - Creating the Formats */
PROC FORMAT;

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
	 VALUE release
        1 = '1 - Main Sample'
        2 = '2 - Reserve Sample'
        9 = '9 - New Release Sample';

    VALUE RFDK_F
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

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

run;
/* Section #2 - Input statement with variable name and location on the .txt file  
		Reminder - change [PATH] to reflect your file locations       */
Data Tracker_file;
INFILE  "[PATH]\NHATS_Round_2_Tracker_File_v2.txt"

LRECL=3148 ;
INPUT @1 spid 8.
@9 w2varstrat 2.
@11 w2varunit 2.
@13 yearsample 4.
@17 r2status 2.
@19 r2casestdtmt 2.
@21 r2casestdtyr 4.
@25 r2spstat 2.
@27 r2spstatdtmt 2.
@29 r2spstatdtyr 4.
@33 r2fqstat 2.
@35 r2fqstatdtmt 2.
@37 r2fqstatdtyr 4.
@41 w2trfinwgt0 18.11
@59 w2trfinwgt1 18.11
@77 w2trfinwgt2 18.11
@95 w2trfinwgt3 18.11
@113 w2trfinwgt4 18.11
@131 w2trfinwgt5 18.11
@149 w2trfinwgt6 18.11
@167 w2trfinwgt7 18.11
@185 w2trfinwgt8 18.11
@203 w2trfinwgt9 18.11
@221 w2trfinwgt10 18.11
@239 w2trfinwgt11 18.11
@257 w2trfinwgt12 18.11
@275 w2trfinwgt13 18.11
@293 w2trfinwgt14 18.11
@311 w2trfinwgt15 18.11
@329 w2trfinwgt16 18.11
@347 w2trfinwgt17 18.11
@365 w2trfinwgt18 18.11
@383 w2trfinwgt19 18.11
@401 w2trfinwgt20 18.11
@419 w2trfinwgt21 18.11
@437 w2trfinwgt22 18.11
@455 w2trfinwgt23 18.11
@473 w2trfinwgt24 18.11
@491 w2trfinwgt25 18.11
@509 w2trfinwgt26 18.11
@527 w2trfinwgt27 18.11
@545 w2trfinwgt28 18.11
@563 w2trfinwgt29 18.11
@581 w2trfinwgt30 18.11
@599 w2trfinwgt31 18.11
@617 w2trfinwgt32 18.11
@635 w2trfinwgt33 18.11
@653 w2trfinwgt34 18.11
@671 w2trfinwgt35 18.11
@689 w2trfinwgt36 18.11
@707 w2trfinwgt37 18.11
@725 w2trfinwgt38 18.11
@743 w2trfinwgt39 18.11
@761 w2trfinwgt40 18.11
@779 w2trfinwgt41 18.11
@797 w2trfinwgt42 18.11
@815 w2trfinwgt43 18.11
@833 w2trfinwgt44 18.11
@851 w2trfinwgt45 18.11
@869 w2trfinwgt46 18.11
@887 w2trfinwgt47 18.11
@905 w2trfinwgt48 18.11
@923 w2trfinwgt49 18.11
@941 w2trfinwgt50 18.11
@959 w2trfinwgt51 18.11
@977 w2trfinwgt52 18.11
@995 w2trfinwgt53 18.11
@1013 w2trfinwgt54 18.11
@1031 w2trfinwgt55 18.11
@1049 w2trfinwgt56 18.11
@1067 r1status 2.
@1069 r1wavrelease 2.
@1071 r1casestdtmt 2.
@1073 r1casestdtyr 4.
@1077 r1spstat 2.
@1079 r1spstatdtmt 2.
@1081 r1spstatdtyr 4.
@1085 r1fqstat 2.
@1087 r1fqstatdtmt 2.
@1089 r1fqstatdtyr 4.
@1093 w1varstrat 2.
@1095 w1varunit 2.
@1097 w1trbswgt0 18.11
@1115 w1trbswgt1 18.11
@1133 w1trbswgt2 18.11
@1151 w1trbswgt3 18.11
@1169 w1trbswgt4 18.11
@1187 w1trbswgt5 18.11
@1205 w1trbswgt6 18.11
@1223 w1trbswgt7 18.11
@1241 w1trbswgt8 18.11
@1259 w1trbswgt9 18.11
@1277 w1trbswgt10 18.11
@1295 w1trbswgt11 18.11
@1313 w1trbswgt12 18.11
@1331 w1trbswgt13 18.11
@1349 w1trbswgt14 18.11
@1367 w1trbswgt15 18.11
@1385 w1trbswgt16 18.11
@1403 w1trbswgt17 18.11
@1421 w1trbswgt18 18.11
@1439 w1trbswgt19 18.11
@1457 w1trbswgt20 18.11
@1475 w1trbswgt21 18.11
@1493 w1trbswgt22 18.11
@1511 w1trbswgt23 18.11
@1529 w1trbswgt24 18.11
@1547 w1trbswgt25 18.11
@1565 w1trbswgt26 18.11
@1583 w1trbswgt27 18.11
@1601 w1trbswgt28 18.11
@1619 w1trbswgt29 18.11
@1637 w1trbswgt30 18.11
@1655 w1trbswgt31 18.11
@1673 w1trbswgt32 18.11
@1691 w1trbswgt33 18.11
@1709 w1trbswgt34 18.11
@1727 w1trbswgt35 18.11
@1745 w1trbswgt36 18.11
@1763 w1trbswgt37 18.11
@1781 w1trbswgt38 18.11
@1799 w1trbswgt39 18.11
@1817 w1trbswgt40 18.11
@1835 w1trbswgt41 18.11
@1853 w1trbswgt42 18.11
@1871 w1trbswgt43 18.11
@1889 w1trbswgt44 18.11
@1907 w1trbswgt45 18.11
@1925 w1trbswgt46 18.11
@1943 w1trbswgt47 18.11
@1961 w1trbswgt48 18.11
@1979 w1trbswgt49 18.11
@1997 w1trbswgt50 18.11
@2015 w1trbswgt51 18.11
@2033 w1trbswgt52 18.11
@2051 w1trbswgt53 18.11
@2069 w1trbswgt54 18.11
@2087 w1trbswgt55 18.11
@2105 w1trbswgt56 18.11
@2123 w1trfinwgt0 18.11
@2141 w1trfinwgt1 18.11
@2159 w1trfinwgt2 18.11
@2177 w1trfinwgt3 18.11
@2195 w1trfinwgt4 18.11
@2213 w1trfinwgt5 18.11
@2231 w1trfinwgt6 18.11
@2249 w1trfinwgt7 18.11
@2267 w1trfinwgt8 18.11
@2285 w1trfinwgt9 18.11
@2303 w1trfinwgt10 18.11
@2321 w1trfinwgt11 18.11
@2339 w1trfinwgt12 18.11
@2357 w1trfinwgt13 18.11
@2375 w1trfinwgt14 18.11
@2393 w1trfinwgt15 18.11
@2411 w1trfinwgt16 18.11
@2429 w1trfinwgt17 18.11
@2447 w1trfinwgt18 18.11
@2465 w1trfinwgt19 18.11
@2483 w1trfinwgt20 18.11
@2501 w1trfinwgt21 18.11
@2519 w1trfinwgt22 18.11
@2537 w1trfinwgt23 18.11
@2555 w1trfinwgt24 18.11
@2573 w1trfinwgt25 18.11
@2591 w1trfinwgt26 18.11
@2609 w1trfinwgt27 18.11
@2627 w1trfinwgt28 18.11
@2645 w1trfinwgt29 18.11
@2663 w1trfinwgt30 18.11
@2681 w1trfinwgt31 18.11
@2699 w1trfinwgt32 18.11
@2717 w1trfinwgt33 18.11
@2735 w1trfinwgt34 18.11
@2753 w1trfinwgt35 18.11
@2771 w1trfinwgt36 18.11
@2789 w1trfinwgt37 18.11
@2807 w1trfinwgt38 18.11
@2825 w1trfinwgt39 18.11
@2843 w1trfinwgt40 18.11
@2861 w1trfinwgt41 18.11
@2879 w1trfinwgt42 18.11
@2897 w1trfinwgt43 18.11
@2915 w1trfinwgt44 18.11
@2933 w1trfinwgt45 18.11
@2951 w1trfinwgt46 18.11
@2969 w1trfinwgt47 18.11
@2987 w1trfinwgt48 18.11
@3005 w1trfinwgt49 18.11
@3023 w1trfinwgt50 18.11
@3041 w1trfinwgt51 18.11
@3059 w1trfinwgt52 18.11
@3077 w1trfinwgt53 18.11
@3095 w1trfinwgt54 18.11
@3113 w1trfinwgt55 18.11
@3131 w1trfinwgt56 18.11;
	
/* Section #3 - format assignment statement   */
format r2status	r2spstat r2fqstat r1status r1spstat r1fqstat	DISP_F.
		r1wavrelease	RELEASE.
		yearsample r2casestdtyr	r2spstatdtyr r2fqstatdtyr r1casestdtyr r1spstatdtyr r1fqstatdtyr RFDK_F.
		r2casestdtmt r2spstatdtmt r2fqstatdtmt r1casestdtmt r1spstatdtmt r1fqstatdtmt STAT_DTA.
 ;
/* Section #4 - Label assignment statement   */
label spid="NHATS SAMPLED PERSON ID"
w2varstrat="R2 VARIANCE ESTIMATION STRATUM"
w2varunit="R2 VARIANCE ESTIMATION CLUSTER"
yearsample="YEAR SP ENTERED SAMPLE"
r2status="R2 OVERALL CASE STATUS"
r2casestdtmt="R2 OVERALL CASE STATUS DATE MT"
r2casestdtyr="R2 OVERALL CASE STATUS DATE YR"
r2spstat="R2 SUBJECT PERSON INTRVW STAT"
r2spstatdtmt="R2 SUBJECT PERSON INTRVW STAT DT MT"
r2spstatdtyr="R2 SUBJECT PERSON INTRVW STAT DT YR"
r2fqstat="R2 FACILITY QUESTIONNAIRE STATUS"
r2fqstatdtmt="R2 FACILITY QUESTNNR STAT DT MTH"
r2fqstatdtyr="R2 FACILITY QUESTNNR STAT DT YR"
w2trfinwgt0="R2 TRACKER FINAL WGT FULL SAMP"
w2trfinwgt1="R2 TRACKER FINAL WGT REP 1"
w2trfinwgt2="R2 TRACKER FINAL WGT REP 2"
w2trfinwgt3="R2 TRACKER FINAL WGT REP 3"
w2trfinwgt4="R2 TRACKER FINAL WGT REP 4"
w2trfinwgt5="R2 TRACKER FINAL WGT REP 5"
w2trfinwgt6="R2 TRACKER FINAL WGT REP 6"
w2trfinwgt7="R2 TRACKER FINAL WGT REP 7"
w2trfinwgt8="R2 TRACKER FINAL WGT REP 8"
w2trfinwgt9="R2 TRACKER FINAL WGT REP 9"
w2trfinwgt10="R2 TRACKER FINAL WGT REP 10"
w2trfinwgt11="R2 TRACKER FINAL WGT REP 11"
w2trfinwgt12="R2 TRACKER FINAL WGT REP 12"
w2trfinwgt13="R2 TRACKER FINAL WGT REP 13"
w2trfinwgt14="R2 TRACKER FINAL WGT REP 14"
w2trfinwgt15="R2 TRACKER FINAL WGT REP 15"
w2trfinwgt16="R2 TRACKER FINAL WGT REP 16"
w2trfinwgt17="R2 TRACKER FINAL WGT REP 17"
w2trfinwgt18="R2 TRACKER FINAL WGT REP 18"
w2trfinwgt19="R2 TRACKER FINAL WGT REP 19"
w2trfinwgt20="R2 TRACKER FINAL WGT REP 20"
w2trfinwgt21="R2 TRACKER FINAL WGT REP 21"
w2trfinwgt22="R2 TRACKER FINAL WGT REP 22"
w2trfinwgt23="R2 TRACKER FINAL WGT REP 23"
w2trfinwgt24="R2 TRACKER FINAL WGT REP 24"
w2trfinwgt25="R2 TRACKER FINAL WGT REP 25"
w2trfinwgt26="R2 TRACKER FINAL WGT REP 26"
w2trfinwgt27="R2 TRACKER FINAL WGT REP 27"
w2trfinwgt28="R2 TRACKER FINAL WGT REP 28"
w2trfinwgt29="R2 TRACKER FINAL WGT REP 29"
w2trfinwgt30="R2 TRACKER FINAL WGT REP 30"
w2trfinwgt31="R2 TRACKER FINAL WGT REP 31"
w2trfinwgt32="R2 TRACKER FINAL WGT REP 32"
w2trfinwgt33="R2 TRACKER FINAL WGT REP 33"
w2trfinwgt34="R2 TRACKER FINAL WGT REP 34"
w2trfinwgt35="R2 TRACKER FINAL WGT REP 35"
w2trfinwgt36="R2 TRACKER FINAL WGT REP 36"
w2trfinwgt37="R2 TRACKER FINAL WGT REP 37"
w2trfinwgt38="R2 TRACKER FINAL WGT REP 38"
w2trfinwgt39="R2 TRACKER FINAL WGT REP 39"
w2trfinwgt40="R2 TRACKER FINAL WGT REP 40"
w2trfinwgt41="R2 TRACKER FINAL WGT REP 41"
w2trfinwgt42="R2 TRACKER FINAL WGT REP 42"
w2trfinwgt43="R2 TRACKER FINAL WGT REP 43"
w2trfinwgt44="R2 TRACKER FINAL WGT REP 44"
w2trfinwgt45="R2 TRACKER FINAL WGT REP 45"
w2trfinwgt46="R2 TRACKER FINAL WGT REP 46"
w2trfinwgt47="R2 TRACKER FINAL WGT REP 47"
w2trfinwgt48="R2 TRACKER FINAL WGT REP 48"
w2trfinwgt49="R2 TRACKER FINAL WGT REP 49"
w2trfinwgt50="R2 TRACKER FINAL WGT REP 50"
w2trfinwgt51="R2 TRACKER FINAL WGT REP 51"
w2trfinwgt52="R2 TRACKER FINAL WGT REP 52"
w2trfinwgt53="R2 TRACKER FINAL WGT REP 53"
w2trfinwgt54="R2 TRACKER FINAL WGT REP 54"
w2trfinwgt55="R2 TRACKER FINAL WGT REP 55"
w2trfinwgt56="R2 TRACKER FINAL WGT REP 56"
r1status="R1 OVERALL CASE STATUS"
r1wavrelease="R1 SAMPLE RELEASE WAVE 1 OR 2"
r1casestdtmt="R1 OVERALL CASE STATUS DATE MT"
r1casestdtyr="R1 OVERALL CASE STATUS DATE YR"
r1spstat="R1 SUBJECT PERSON INTRVW STAT"
r1spstatdtmt="R1 SUBJECT PERSON INTRVW STAT DT MT"
r1spstatdtyr="R1 SUBJECT PERSON INTRVW STAT DT YR"
r1fqstat="R1 FACILITY QUESTIONNAIRE STATUS"
r1fqstatdtmt="R1 FACILITY QUESTNNR STAT DT MTH"
r1fqstatdtyr="R1 FACILITY QUESTNNR STAT DT YR"
w1varstrat="R1 VARIANCE ESTIMATION STRATUM"
w1varunit="R1 VARIANCE ESTIMATION CLUSTER"
w1trbswgt0="R1 TRACKER BASE WGT FULL SAMP"
w1trbswgt1="R1 TRACKER BASE WGT REP 1"
w1trbswgt2="R1 TRACKER BASE WGT REP 2"
w1trbswgt3="R1 TRACKER BASE WGT REP 3"
w1trbswgt4="R1 TRACKER BASE WGT REP 4"
w1trbswgt5="R1 TRACKER BASE WGT REP 5"
w1trbswgt6="R1 TRACKER BASE WGT REP 6"
w1trbswgt7="R1 TRACKER BASE WGT REP 7"
w1trbswgt8="R1 TRACKER BASE WGT REP 8"
w1trbswgt9="R1 TRACKER BASE WGT REP 9"
w1trbswgt10="R1 TRACKER BASE WGT REP 10"
w1trbswgt11="R1 TRACKER BASE WGT REP 11"
w1trbswgt12="R1 TRACKER BASE WGT REP 12"
w1trbswgt13="R1 TRACKER BASE WGT REP 13"
w1trbswgt14="R1 TRACKER BASE WGT REP 14"
w1trbswgt15="R1 TRACKER BASE WGT REP 15"
w1trbswgt16="R1 TRACKER BASE WGT REP 16"
w1trbswgt17="R1 TRACKER BASE WGT REP 17"
w1trbswgt18="R1 TRACKER BASE WGT REP 18"
w1trbswgt19="R1 TRACKER BASE WGT REP 19"
w1trbswgt20="R1 TRACKER BASE WGT REP 20"
w1trbswgt21="R1 TRACKER BASE WGT REP 21"
w1trbswgt22="R1 TRACKER BASE WGT REP 22"
w1trbswgt23="R1 TRACKER BASE WGT REP 23"
w1trbswgt24="R1 TRACKER BASE WGT REP 24"
w1trbswgt25="R1 TRACKER BASE WGT REP 25"
w1trbswgt26="R1 TRACKER BASE WGT REP 26"
w1trbswgt27="R1 TRACKER BASE WGT REP 27"
w1trbswgt28="R1 TRACKER BASE WGT REP 28"
w1trbswgt29="R1 TRACKER BASE WGT REP 29"
w1trbswgt30="R1 TRACKER BASE WGT REP 30"
w1trbswgt31="R1 TRACKER BASE WGT REP 31"
w1trbswgt32="R1 TRACKER BASE WGT REP 32"
w1trbswgt33="R1 TRACKER BASE WGT REP 33"
w1trbswgt34="R1 TRACKER BASE WGT REP 34"
w1trbswgt35="R1 TRACKER BASE WGT REP 35"
w1trbswgt36="R1 TRACKER BASE WGT REP 36"
w1trbswgt37="R1 TRACKER BASE WGT REP 37"
w1trbswgt38="R1 TRACKER BASE WGT REP 38"
w1trbswgt39="R1 TRACKER BASE WGT REP 39"
w1trbswgt40="R1 TRACKER BASE WGT REP 40"
w1trbswgt41="R1 TRACKER BASE WGT REP 41"
w1trbswgt42="R1 TRACKER BASE WGT REP 42"
w1trbswgt43="R1 TRACKER BASE WGT REP 43"
w1trbswgt44="R1 TRACKER BASE WGT REP 44"
w1trbswgt45="R1 TRACKER BASE WGT REP 45"
w1trbswgt46="R1 TRACKER BASE WGT REP 46"
w1trbswgt47="R1 TRACKER BASE WGT REP 47"
w1trbswgt48="R1 TRACKER BASE WGT REP 48"
w1trbswgt49="R1 TRACKER BASE WGT REP 49"
w1trbswgt50="R1 TRACKER BASE WGT REP 50"
w1trbswgt51="R1 TRACKER BASE WGT REP 51"
w1trbswgt52="R1 TRACKER BASE WGT REP 52"
w1trbswgt53="R1 TRACKER BASE WGT REP 53"
w1trbswgt54="R1 TRACKER BASE WGT REP 54"
w1trbswgt55="R1 TRACKER BASE WGT REP 55"
w1trbswgt56="R1 TRACKER BASE WGT REP 56"
w1trfinwgt0="R1 TRACKER FINAL WGT FULL SAMP"
w1trfinwgt1="R1 TRACKER FINAL WGT REP 1"
w1trfinwgt2="R1 TRACKER FINAL WGT REP 2"
w1trfinwgt3="R1 TRACKER FINAL WGT REP 3"
w1trfinwgt4="R1 TRACKER FINAL WGT REP 4"
w1trfinwgt5="R1 TRACKER FINAL WGT REP 5"
w1trfinwgt6="R1 TRACKER FINAL WGT REP 6"
w1trfinwgt7="R1 TRACKER FINAL WGT REP 7"
w1trfinwgt8="R1 TRACKER FINAL WGT REP 8"
w1trfinwgt9="R1 TRACKER FINAL WGT REP 9"
w1trfinwgt10="R1 TRACKER FINAL WGT REP 10"
w1trfinwgt11="R1 TRACKER FINAL WGT REP 11"
w1trfinwgt12="R1 TRACKER FINAL WGT REP 12"
w1trfinwgt13="R1 TRACKER FINAL WGT REP 13"
w1trfinwgt14="R1 TRACKER FINAL WGT REP 14"
w1trfinwgt15="R1 TRACKER FINAL WGT REP 15"
w1trfinwgt16="R1 TRACKER FINAL WGT REP 16"
w1trfinwgt17="R1 TRACKER FINAL WGT REP 17"
w1trfinwgt18="R1 TRACKER FINAL WGT REP 18"
w1trfinwgt19="R1 TRACKER FINAL WGT REP 19"
w1trfinwgt20="R1 TRACKER FINAL WGT REP 20"
w1trfinwgt21="R1 TRACKER FINAL WGT REP 21"
w1trfinwgt22="R1 TRACKER FINAL WGT REP 22"
w1trfinwgt23="R1 TRACKER FINAL WGT REP 23"
w1trfinwgt24="R1 TRACKER FINAL WGT REP 24"
w1trfinwgt25="R1 TRACKER FINAL WGT REP 25"
w1trfinwgt26="R1 TRACKER FINAL WGT REP 26"
w1trfinwgt27="R1 TRACKER FINAL WGT REP 27"
w1trfinwgt28="R1 TRACKER FINAL WGT REP 28"
w1trfinwgt29="R1 TRACKER FINAL WGT REP 29"
w1trfinwgt30="R1 TRACKER FINAL WGT REP 30"
w1trfinwgt31="R1 TRACKER FINAL WGT REP 31"
w1trfinwgt32="R1 TRACKER FINAL WGT REP 32"
w1trfinwgt33="R1 TRACKER FINAL WGT REP 33"
w1trfinwgt34="R1 TRACKER FINAL WGT REP 34"
w1trfinwgt35="R1 TRACKER FINAL WGT REP 35"
w1trfinwgt36="R1 TRACKER FINAL WGT REP 36"
w1trfinwgt37="R1 TRACKER FINAL WGT REP 37"
w1trfinwgt38="R1 TRACKER FINAL WGT REP 38"
w1trfinwgt39="R1 TRACKER FINAL WGT REP 39"
w1trfinwgt40="R1 TRACKER FINAL WGT REP 40"
w1trfinwgt41="R1 TRACKER FINAL WGT REP 41"
w1trfinwgt42="R1 TRACKER FINAL WGT REP 42"
w1trfinwgt43="R1 TRACKER FINAL WGT REP 43"
w1trfinwgt44="R1 TRACKER FINAL WGT REP 44"
w1trfinwgt45="R1 TRACKER FINAL WGT REP 45"
w1trfinwgt46="R1 TRACKER FINAL WGT REP 46"
w1trfinwgt47="R1 TRACKER FINAL WGT REP 47"
w1trfinwgt48="R1 TRACKER FINAL WGT REP 48"
w1trfinwgt49="R1 TRACKER FINAL WGT REP 49"
w1trfinwgt50="R1 TRACKER FINAL WGT REP 50"
w1trfinwgt51="R1 TRACKER FINAL WGT REP 51"
w1trfinwgt52="R1 TRACKER FINAL WGT REP 52"
w1trfinwgt53="R1 TRACKER FINAL WGT REP 53"
w1trfinwgt54="R1 TRACKER FINAL WGT REP 54"
w1trfinwgt55="R1 TRACKER FINAL WGT REP 55"
w1trfinwgt56="R1 TRACKER FINAL WGT REP 56";

run;
