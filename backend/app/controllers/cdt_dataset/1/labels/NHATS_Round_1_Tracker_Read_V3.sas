/* NHATS_Round_1_Read_Tracker_V3.SAS - Public Use - */

/* Section #1 - Creating the Formats */
proc format;
VALUE DISP_a
          10 = "10 Not Available"
          11 = "11 Ready"
          12 = "12 Started"
          20 = "20 Final"
          24 = "24 Not Required"
          60 = "60 Complete"
          61 = "61 Complete, NH facility"
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
   ;
       VALUE STAT_DTa
          4 = " 4 April"
          5 = " 5 May"
          6 = " 6 June"
          7 = " 7 July"
          8 = " 8 August"
          9 = " 9 September"
         10 = "10 October"
         11 = "11 November"
         99 = "99 Prior to start of field work";
	VALUE RFDK_Y
	     1 = ' 1 Yes'
	    -7 = '-7 RF'
 	    -8 = '-8 DK'
  	    -1 = '-1 Inapplicable'
	    -9 = '-9 Missing';
	VALUE release
        1 = '1 - Main Sample'
        2 = '2 - Reserve Sample'
        9 = '9 - New Release Sample';
run;
/* Section #2 - Input statement with variable name and location on the .txt file  */

Data trackerfile;
INFILE  "[PATH]\NHATS_Round_1_Tracker_File_V3.txt"
LRECL=2095 ;
INPUT @1 spid 8.
@9 w1varstrat 2.
@11 w1varunit 2.
@13 yearsample 4.
@17 r1status 2.
@19 r1wavrelease 2.
@21 r1casestdtmt 2.
@23 r1casestdtyr 4.
@27 r1spstat 2.
@29 r1spstatdtmt 2.
@31 r1spstatdtyr 4.
@35 r1fqstat 2.
@37 r1fqstatdtmt 2.
@39 r1fqstatdtyr 4.
@43 w1trbswgt0 18.11
@61 w1trbswgt1 18.11
@79 w1trbswgt2 18.11
@97 w1trbswgt3 18.11
@115 w1trbswgt4 18.11
@133 w1trbswgt5 18.11
@151 w1trbswgt6 18.11
@169 w1trbswgt7 18.11
@187 w1trbswgt8 18.11
@205 w1trbswgt9 18.11
@223 w1trbswgt10 18.11
@241 w1trbswgt11 18.11
@259 w1trbswgt12 18.11
@277 w1trbswgt13 18.11
@295 w1trbswgt14 18.11
@313 w1trbswgt15 18.11
@331 w1trbswgt16 18.11
@349 w1trbswgt17 18.11
@367 w1trbswgt18 18.11
@385 w1trbswgt19 18.11
@403 w1trbswgt20 18.11
@421 w1trbswgt21 18.11
@439 w1trbswgt22 18.11
@457 w1trbswgt23 18.11
@475 w1trbswgt24 18.11
@493 w1trbswgt25 18.11
@511 w1trbswgt26 18.11
@529 w1trbswgt27 18.11
@547 w1trbswgt28 18.11
@565 w1trbswgt29 18.11
@583 w1trbswgt30 18.11
@601 w1trbswgt31 18.11
@619 w1trbswgt32 18.11
@637 w1trbswgt33 18.11
@655 w1trbswgt34 18.11
@673 w1trbswgt35 18.11
@691 w1trbswgt36 18.11
@709 w1trbswgt37 18.11
@727 w1trbswgt38 18.11
@745 w1trbswgt39 18.11
@763 w1trbswgt40 18.11
@781 w1trbswgt41 18.11
@799 w1trbswgt42 18.11
@817 w1trbswgt43 18.11
@835 w1trbswgt44 18.11
@853 w1trbswgt45 18.11
@871 w1trbswgt46 18.11
@889 w1trbswgt47 18.11
@907 w1trbswgt48 18.11
@925 w1trbswgt49 18.11
@943 w1trbswgt50 18.11
@961 w1trbswgt51 18.11
@979 w1trbswgt52 18.11
@997 w1trbswgt53 18.11
@1015 w1trbswgt54 18.11
@1033 w1trbswgt55 18.11
@1051 w1trbswgt56 18.11
@1069 w1trfinwgt0 18.11
@1087 w1trfinwgt1 18.11
@1105 w1trfinwgt2 18.11
@1123 w1trfinwgt3 18.11
@1141 w1trfinwgt4 18.11
@1159 w1trfinwgt5 18.11
@1177 w1trfinwgt6 18.11
@1195 w1trfinwgt7 18.11
@1213 w1trfinwgt8 18.11
@1231 w1trfinwgt9 18.11
@1249 w1trfinwgt10 18.11
@1267 w1trfinwgt11 18.11
@1285 w1trfinwgt12 18.11
@1303 w1trfinwgt13 18.11
@1321 w1trfinwgt14 18.11
@1339 w1trfinwgt15 18.11
@1357 w1trfinwgt16 18.11
@1375 w1trfinwgt17 18.11
@1393 w1trfinwgt18 18.11
@1411 w1trfinwgt19 18.11
@1429 w1trfinwgt20 18.11
@1447 w1trfinwgt21 18.11
@1465 w1trfinwgt22 18.11
@1483 w1trfinwgt23 18.11
@1501 w1trfinwgt24 18.11
@1519 w1trfinwgt25 18.11
@1537 w1trfinwgt26 18.11
@1555 w1trfinwgt27 18.11
@1573 w1trfinwgt28 18.11
@1591 w1trfinwgt29 18.11
@1609 w1trfinwgt30 18.11
@1627 w1trfinwgt31 18.11
@1645 w1trfinwgt32 18.11
@1663 w1trfinwgt33 18.11
@1681 w1trfinwgt34 18.11
@1699 w1trfinwgt35 18.11
@1717 w1trfinwgt36 18.11
@1735 w1trfinwgt37 18.11
@1753 w1trfinwgt38 18.11
@1771 w1trfinwgt39 18.11
@1789 w1trfinwgt40 18.11
@1807 w1trfinwgt41 18.11
@1825 w1trfinwgt42 18.11
@1843 w1trfinwgt43 18.11
@1861 w1trfinwgt44 18.11
@1879 w1trfinwgt45 18.11
@1897 w1trfinwgt46 18.11
@1915 w1trfinwgt47 18.11
@1933 w1trfinwgt48 18.11
@1951 w1trfinwgt49 18.11
@1969 w1trfinwgt50 18.11
@1987 w1trfinwgt51 18.11
@2005 w1trfinwgt52 18.11
@2023 w1trfinwgt53 18.11
@2041 w1trfinwgt54 18.11
@2059 w1trfinwgt55 18.11
@2077 w1trfinwgt56 18.11;

/* Section #3 - format assignment statement   */
format r1status r1spstat r1fqstat DISP_a.
		r1casestdtmt r1spstatdtmt r1fqstatdtmt	STAT_DTa.
		r1wavrelease  release.;
/* Section #4 - Label assignment statement   */
label
spid ="NHATS SAMPLED PERSON ID"
w1varstrat ="r1 variance estimation stratum"
w1varunit ="r1 variance estimation cluster"
yearsample ="YEAR SP ENTERED SAMPLE"
r1status ="R1 OVERALL CASE STATUS"
r1wavrelease ="R1 SAMPLE RELEASE WAVE 1 OR 2"
r1casestdtmt ="R1 OVERALL CASE STATUS DATE MT"
r1casestdtyr ="R1 OVERALL CASE STATUS DATE YR"
r1spstat ="R1 SUBJECT PERSON INTRVW STAT"
r1spstatdtmt ="R1 SUBJECT PERSON INTRVW STAT DT MT"
r1spstatdtyr ="R1 SUBJECT PERSON INTRVW STAT DT YR"
r1fqstat ="R1 FACILITY QUESTIONNAIRE STATUS"
r1fqstatdtmt ="R1 FACILITY QUESTNNR STAT DT MTH"
r1fqstatdtyr ="R1 FACILITY QUESTNNR STAT DT YR"
w1trbswgt0 ="R1 TRACKER BASE WGT FULL SAMP"
w1trbswgt1 ="R1 TRACKER BASE WGT REP 1"
w1trbswgt2 ="R1 TRACKER BASE WGT REP 2"
w1trbswgt3 ="R1 TRACKER BASE WGT REP 3"
w1trbswgt4 ="R1 TRACKER BASE WGT REP 4"
w1trbswgt5 ="R1 TRACKER BASE WGT REP 5"
w1trbswgt6 ="R1 TRACKER BASE WGT REP 6"
w1trbswgt7 ="R1 TRACKER BASE WGT REP 7"
w1trbswgt8 ="R1 TRACKER BASE WGT REP 8"
w1trbswgt9 ="R1 TRACKER BASE WGT REP 9"
w1trbswgt10 ="R1 TRACKER BASE WGT REP 10"
w1trbswgt11 ="R1 TRACKER BASE WGT REP 11"
w1trbswgt12 ="R1 TRACKER BASE WGT REP 12"
w1trbswgt13 ="R1 TRACKER BASE WGT REP 13"
w1trbswgt14 ="R1 TRACKER BASE WGT REP 14"
w1trbswgt15 ="R1 TRACKER BASE WGT REP 15"
w1trbswgt16 ="R1 TRACKER BASE WGT REP 16"
w1trbswgt17 ="R1 TRACKER BASE WGT REP 17"
w1trbswgt18 ="R1 TRACKER BASE WGT REP 18"
w1trbswgt19 ="R1 TRACKER BASE WGT REP 19"
w1trbswgt20 ="R1 TRACKER BASE WGT REP 20"
w1trbswgt21 ="R1 TRACKER BASE WGT REP 21"
w1trbswgt22 ="R1 TRACKER BASE WGT REP 22"
w1trbswgt23 ="R1 TRACKER BASE WGT REP 23"
w1trbswgt24 ="R1 TRACKER BASE WGT REP 24"
w1trbswgt25 ="R1 TRACKER BASE WGT REP 25"
w1trbswgt26 ="R1 TRACKER BASE WGT REP 26"
w1trbswgt27 ="R1 TRACKER BASE WGT REP 27"
w1trbswgt28 ="R1 TRACKER BASE WGT REP 28"
w1trbswgt29 ="R1 TRACKER BASE WGT REP 29"
w1trbswgt30 ="R1 TRACKER BASE WGT REP 30"
w1trbswgt31 ="R1 TRACKER BASE WGT REP 31"
w1trbswgt32 ="R1 TRACKER BASE WGT REP 32"
w1trbswgt33 ="R1 TRACKER BASE WGT REP 33"
w1trbswgt34 ="R1 TRACKER BASE WGT REP 34"
w1trbswgt35 ="R1 TRACKER BASE WGT REP 35"
w1trbswgt36 ="R1 TRACKER BASE WGT REP 36"
w1trbswgt37 ="R1 TRACKER BASE WGT REP 37"
w1trbswgt38 ="R1 TRACKER BASE WGT REP 38"
w1trbswgt39 ="R1 TRACKER BASE WGT REP 39"
w1trbswgt40 ="R1 TRACKER BASE WGT REP 40"
w1trbswgt41 ="R1 TRACKER BASE WGT REP 41"
w1trbswgt42 ="R1 TRACKER BASE WGT REP 42"
w1trbswgt43 ="R1 TRACKER BASE WGT REP 43"
w1trbswgt44 ="R1 TRACKER BASE WGT REP 44"
w1trbswgt45 ="R1 TRACKER BASE WGT REP 45"
w1trbswgt46 ="R1 TRACKER BASE WGT REP 46"
w1trbswgt47 ="R1 TRACKER BASE WGT REP 47"
w1trbswgt48 ="R1 TRACKER BASE WGT REP 48"
w1trbswgt49 ="R1 TRACKER BASE WGT REP 49"
w1trbswgt50 ="R1 TRACKER BASE WGT REP 50"
w1trbswgt51 ="R1 TRACKER BASE WGT REP 51"
w1trbswgt52 ="R1 TRACKER BASE WGT REP 52"
w1trbswgt53 ="R1 TRACKER BASE WGT REP 53"
w1trbswgt54 ="R1 TRACKER BASE WGT REP 54"
w1trbswgt55 ="R1 TRACKER BASE WGT REP 55"
w1trbswgt56 ="R1 TRACKER BASE WGT REP 56"
w1trfinwgt0 ="R1 TRACKER FINAL WGT FULL SAMP"
w1trfinwgt1 ="R1 TRACKER FINAL WGT REP 1"
w1trfinwgt2 ="R1 TRACKER FINAL WGT REP 2"
w1trfinwgt3 ="R1 TRACKER FINAL WGT REP 3"
w1trfinwgt4 ="R1 TRACKER FINAL WGT REP 4"
w1trfinwgt5 ="R1 TRACKER FINAL WGT REP 5"
w1trfinwgt6 ="R1 TRACKER FINAL WGT REP 6"
w1trfinwgt7 ="R1 TRACKER FINAL WGT REP 7"
w1trfinwgt8 ="R1 TRACKER FINAL WGT REP 8"
w1trfinwgt9 ="R1 TRACKER FINAL WGT REP 9"
w1trfinwgt10 ="R1 TRACKER FINAL WGT REP 10"
w1trfinwgt11 ="R1 TRACKER FINAL WGT REP 11"
w1trfinwgt12 ="R1 TRACKER FINAL WGT REP 12"
w1trfinwgt13 ="R1 TRACKER FINAL WGT REP 13"
w1trfinwgt14 ="R1 TRACKER FINAL WGT REP 14"
w1trfinwgt15 ="R1 TRACKER FINAL WGT REP 15"
w1trfinwgt16 ="R1 TRACKER FINAL WGT REP 16"
w1trfinwgt17 ="R1 TRACKER FINAL WGT REP 17"
w1trfinwgt18 ="R1 TRACKER FINAL WGT REP 18"
w1trfinwgt19 ="R1 TRACKER FINAL WGT REP 19"
w1trfinwgt20 ="R1 TRACKER FINAL WGT REP 20"
w1trfinwgt21 ="R1 TRACKER FINAL WGT REP 21"
w1trfinwgt22 ="R1 TRACKER FINAL WGT REP 22"
w1trfinwgt23 ="R1 TRACKER FINAL WGT REP 23"
w1trfinwgt24 ="R1 TRACKER FINAL WGT REP 24"
w1trfinwgt25 ="R1 TRACKER FINAL WGT REP 25"
w1trfinwgt26 ="R1 TRACKER FINAL WGT REP 26"
w1trfinwgt27 ="R1 TRACKER FINAL WGT REP 27"
w1trfinwgt28 ="R1 TRACKER FINAL WGT REP 28"
w1trfinwgt29 ="R1 TRACKER FINAL WGT REP 29"
w1trfinwgt30 ="R1 TRACKER FINAL WGT REP 30"
w1trfinwgt31 ="R1 TRACKER FINAL WGT REP 31"
w1trfinwgt32 ="R1 TRACKER FINAL WGT REP 32"
w1trfinwgt33 ="R1 TRACKER FINAL WGT REP 33"
w1trfinwgt34 ="R1 TRACKER FINAL WGT REP 34"
w1trfinwgt35 ="R1 TRACKER FINAL WGT REP 35"
w1trfinwgt36 ="R1 TRACKER FINAL WGT REP 36"
w1trfinwgt37 ="R1 TRACKER FINAL WGT REP 37"
w1trfinwgt38 ="R1 TRACKER FINAL WGT REP 38"
w1trfinwgt39 ="R1 TRACKER FINAL WGT REP 39"
w1trfinwgt40 ="R1 TRACKER FINAL WGT REP 40"
w1trfinwgt41 ="R1 TRACKER FINAL WGT REP 41"
w1trfinwgt42 ="R1 TRACKER FINAL WGT REP 42"
w1trfinwgt43 ="R1 TRACKER FINAL WGT REP 43"
w1trfinwgt44 ="R1 TRACKER FINAL WGT REP 44"
w1trfinwgt45 ="R1 TRACKER FINAL WGT REP 45"
w1trfinwgt46 ="R1 TRACKER FINAL WGT REP 46"
w1trfinwgt47 ="R1 TRACKER FINAL WGT REP 47"
w1trfinwgt48 ="R1 TRACKER FINAL WGT REP 48"
w1trfinwgt49 ="R1 TRACKER FINAL WGT REP 49"
w1trfinwgt50 ="R1 TRACKER FINAL WGT REP 50"
w1trfinwgt51 ="R1 TRACKER FINAL WGT REP 51"
w1trfinwgt52 ="R1 TRACKER FINAL WGT REP 52"
w1trfinwgt53 ="R1 TRACKER FINAL WGT REP 53"
w1trfinwgt54 ="R1 TRACKER FINAL WGT REP 54"
w1trfinwgt55 ="R1 TRACKER FINAL WGT REP 55"
w1trfinwgt56 ="R1 TRACKER FINAL WGT REP 56";

run;

