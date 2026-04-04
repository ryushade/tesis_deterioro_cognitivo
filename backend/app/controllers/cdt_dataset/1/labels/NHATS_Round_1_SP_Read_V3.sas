/* NHATS_Round_1_SP_Read_V3.SAS */

/* Section #1 - Creating the Formats */
proc format;
    VALUE dosfacd /* FOR FQ1dosfacd  */
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
    VALUE dosfaca /* FOR FQ1dosfaca */
       -8 = "-8 DK"
       -1 = "-1 INAPPLICABLE"
        1 = " 1 INDEPENDENT LIVING / HOUSING / RETIREMENT "
        2 = " 2 ASSISTED LIVING / PERSONAL CARE"
        3 = " 3 SPECIAL CARE, MEMORY CARE, OR ALZHEIMER'S UNIT"
        4 = " 4 NURSING HOME"   ;

     VALUE DLOCSP /* FOR FQ1DLOCSP2 */
       -1 = "-1 INAPPLICABLE"
        1 = " 1 INDEPENDENT LIVING "
        2 = " 2 ASSISTED LIVING "
        3 = " 3 SPECIAL CARE UNIT"
        8 = " 8 NOT REPORTED"   ;

      VALUE CODE60_64B /*FOR CODE60_64B*/
       -1 = "-1 INAPPLICABLE"
        1 = " 1 INDEPENDENT LIVING "
        2 = " 2 ASSISTED LIVING, SCU, NOT REPORTED";

     VALUE DLOCSP2F /* FOR FQ1DLOCSP */
       -1 = "-1 Inapplicable"
        1 = " 1 Independent living"
        2 = " 2 Assisted living"
        3 = " 3 Special care unit"
        4 = " 4 Nursing Home"
        8 = " 8 Not reported";
/* used in creation of op1dhrsmth   */
      value gt0f
       -7,-8 = "-7,-8:DK/RF"
       -1 = "-1:Inapp.  "
       -9 = "-9:Missing "
        1-high = ">0";
      VALUE schedf
        1    = "1:Regular"
        2    = "2:Varied"
       -7,-8 = "-7,-8:DK/RF"
       -1    = "-1:Inapp."
       -9    = "-9:Missing" ;
     VALUE ynf
        1    = "1:Yes"
        2    = "2:No"
       -7,-8 = "-7,-8:DK/RF"
       -1    = "-1:Inapp."
       -9    = "-9:Missing"   ;
     value gt0hours
       -12= "-12:valid skip/staff"
       -11= "-11:hours missing"
       -10= "-10:days missing"
       -9 = "-9:days+hrs missing"
       -1 = "-1:Inapp."
       0 = "0:<1 hour/day"
       1-744=">0"
       9999="Not codeable, <1 hour/day";
value hoursf /*with categories for distribution checking*/
       -12= "-12:valid skip/staff"
       -11= "-11:hours missing"
       -10= "-10:days missing"
       -9 = "-9:days+hrs missing"
       -1 = "-1:Inapp."
        0-<1  ="<1"
        1-<10 =" 1-<10"
       10-<20 ="10-<20"
       20-<30 ="20-<30"
       30-<40 ="30-40"
       40-<60 ="40-60"
       60-<120 ="60-120"
       120-<180="120-180"
       180-744="180-744(24/7)"
       9999="Not codeable, <1 hour/day";
*****;
     VALUE release
        1 = '1 - Main Sample'
        2 = '2 - Reserve Sample'
        9 = '9 - New Release Sample';
    VALUE dchntinhh
        1 = '1 - Child identified in interview but not enumerated to OP File'
       -1 = '-1 - inapplicable';

    VALUE dmissadd
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


    VALUE dnsoc
        1 = '1 eligible and interviewed'
        2 = '2 eligible and not interviewed'
        -1 = '-1 inapplicable';

/* FORMATS FOR MDS */
    VALUE INDEP
        1 = '1 Independent'
        2 = '2 Supervision or help'
        3 = '3 Total dependence'
        4 = '4 Activity occurred 2 or fewer times'
        -1 = '-1 inapplicable (not nursing home resident)'
        -8 = '-8 DK';

    VALUE CANE
        1 = '1 normally uses cane'
        2 = '2 no indication normally uses cane'
        -8 = '-8 DK'
        -1 = '-1 inapplicable (not nursing home resident)';

    VALUE WALKER
        1 = '1 normally uses walker'
        2 = '2 no indication normally uses walker'
        -8 = '-8 DK'
        -1 = '-1 inapplicable (not nursing home resident)';

    VALUE WHEELCH
    1 = '1 normally uses wheelchair'
    2 = '2 no indication normally uses wheelchair'
    -8  ='-8 DK'
    -1 = '-1 inapplicable (not nursing home resident)';

	VALUE CS1D_F
		1= '1 Yes'
		2= '2 Yes corrected by NHATS'
		3= '3 No'
		4= '4 Yes but missing OP records for child outside household '
		-1= '-1 Inapplicable'
		-7= '-7 RF'
		-8= '-8 DK'
		-9= '-9 Missing';

    VALUE FQ_4F
          1='1 YES'
          2='2 NO';

    VALUE GENDER
        1 = '1 MALE'
        2 = '2 FEMALE';

    VALUE RFDK
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable (nursing home resident or residential care no FQ)'
    -9 = '-9 Missing';

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

    VALUE DMGETHLP
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing'
    997 = '997 Help Since Birth/Entire Life';

    VALUE CENDIV /* RE1DCENSDIV */
    1 =  '1 Northeast Region: New England Division'
    2 =  '2 Northeast Region: Middle Atlantic Division'
    3 =  '3 Midwest Region: East North Central Division'
    4 =  '4 Midwest Region: West North Central Division'
    5 =  '5 South Region: South Atlantic Division'
    6 =  '6 South Region: East South Central Division'
    7 =  '7 South Region: West South Central Division'
    8 =  '8 West Region: Mountain Division'
    9 =  '9 West Region: Pacific Division'
    -9 = '-9 Not Ascertained (error Missing)';

    VALUE INAPMISS
        -1 = '-1 Inapplicable'
        -7 = '-7 RF'
        -8 = '-8 DK'
        -9 = '-9 Missing'      ;

    VALUE INAPMI_S
        -1 = '-1 Inapplicable'
        -9 = '-9 Children outside SP Household and OP records missing'     ;

    VALUE HT1DRESC
      1 = ' 1 NURSING HOME'
      2 = ' 2 GROUP HOME/ASSTLVNG/CCRC'
      3 = ' 3 RESIDENTIAL CARE'
      4 = ' 4 NOT RESIDENTIAL CARE'
     -7 = '-7 RF'
     -8 = '-8 DK';

   VALUE R1DRESID
     1 = '1 Community '
     2 = '2 Residential Care Resident not nursing home (SP interview complete)'
     3 = '3 Residential Care Resident not nursing home (FQ only)'
     4 = '4 Nursing Home Resident';

   VALUE R1DRES_R
     1 = ' 1 Case recoded from nursing home resident to other residential care'
    -1 = '-1 Inapplicable';


   VALUE HT1DLVNG
    1 = '1 Alone'
    2 = '2 With spouse/partner only [spouse/partner in household]'
    3 = '3 With spouse/partner and with others'
    4 = '4 With others only'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing'  ;

    VALUE DLVNGARR
1 ='1 Alone '
2 ='2 With spouse/partner only [spouse/partner in household]'
3= '3 With spouse/partner and with others'
4= '4 With others only '
-1 = '-1 Inapplicable '
 -9= '-9 Missing ';

    VALUE WORDLIST
     1 = ' 1 YES'
     2 = ' 2 NO'
     3 = ' 3 NO WORDS REMEMBERED'
     4 = ' 4 REFUSED'
    -1 = '-1 Inapplicable (nursing home resident or residential care FQ only)'
    -9 = '-9 Missing'      ;

    VALUE WORDREC
        1 = ' 1 LIST 1'
        2 = ' 2 LIST 2'
        3 = ' 3 LIST 3'
       -1 = '-1 Inapplicable '
       -9 = '-9 Missing';

    VALUE WORDRECO
         1 = ' 1 NO WORDS REMEMBERED'
         2 = ' 2 NO'
        -1 = '-1 Inapplicable '
        -2 = '-2 Proxy says cannot ask SP'
        -3 = '-3 Proxy says can ask SP but SP unable to answer'
        -7 = '-7 SP refused activity'
        -9 = '-9 Missing';

    VALUE WORDRECP
        1  = '1 REFUSED WORD RECALL TASK'
        2  = '2 NO'
        -1 = '-1 Inapplicable '
        -2 = '-2 Proxy says cannot ask SP'
        -3 = '-3 Proxy says can ask SP but SP unable to answer'
        -7 = '-7 SP refused activity'
        -9 = '-9 Missing';

    VALUE WORDRECN
         1 = ' 1 YES'
         2 = ' 2 NO'
        -1 = '-1 Inapplicable '
        -2 = '-2 Proxy says cannot ask SP'
        -3 = '-3 Proxy says can ask SP but SP unable to answer'
        -7 = '-7 SP refused activity'
        -9 = '-9 Missing';

    VALUE WORDRE_N
        -1 = '-1 Inapplicable'
        -2 = '-2 Proxy says cannot ask SP'
        -3 = '-3 Proxy says can ask SP but SP unable to answer'
        -7 = '-7 SP refused activity'
        -9 = '-9 Missing';

    VALUE WORDRE_P
         1 = ' 1 YES'
         2 = ' 2 NO'
        -1 = '-1 Inapplicable'
        -2 = '-2 Proxy says cannot ask SP'
        -3 = '-3 Proxy says can ask SP but SP unable to answer'
        -7 = '-7 SP refused activity'
        -9 = '-9 Missing';

    VALUE WORDRECC
        -1 = '-1 Inapplicable '
        -2 = '-2 Proxy says cannot ask SP'
        -3 = '-3 Proxy says can ask SP but SP unable to answer'
        -7 = '-7 SP refused activity'
        -9 = '-9 Missing';

    VALUE CLOCKSC
        -1 = '-1 Inapplicable'
        -2 = '-2 Proxy says cannot ask SP'
        -3 = '-3 Proxy says can ask SP but SP unable to answer'
        -4 = '-4 SP did not attempt to draw clock'
        -7 = '-7 SP refused to draw clock'
        -9 = '-9 Missing';

    VALUE MDOUTSLF
     1 = " 1 Did not do by self in last month"
     2 = " 2 Did by self in last month/no difficulty"
     3 = " 3 Did by self in last month/difficulty"
     4 = " 4 DKRF did by self in last month/no difficulty"
     5 = " 5 DKRF did by self in  last month/difficulty"
     6 = " 6 Did by self in last month/DKRF difficulty"
     7 = " 7 DKRF did by self in last month/DKRF difficulty"
     8 = " 8 Not done in last month"
    -1 = "-1 Inapplicable "
    -9 = '-9 Missing';

    VALUE MDOUTDEV
     8 = " 8 Not done in last month"
     1 = " 1 No use of devices to go outside in last month"
     2 = " 2 Use of devices to go outside in last month"
     3 = " 3 DKRF if used devices to go outside in last month"
     4 = " 4 DKRF if used devices in last month"
    -1 = "-1 Inapplicable "
    -9 = '-9 Missing';

    VALUE MDOUTHLP
     8 = " 8 Not done in last month"
     1 = " 1 No help to go outside in last month"
     2 = " 2 Had help to go outside in last month"
     3 = " 3 DKRF if had help to go outside in last month"
    -1 = "-1 Inapplicable "
    -9 = '-9 Missing';

    VALUE MODINSLF
     8 = " 8 Not done in last month"
     1 = " 1 Did not do by self in last month"
     2 = " 2 Did by self in last month/no difficulty"
     3 = " 3 Did by self in last month/difficulty"
     4 = " 4 DKRF did by self in last month/no difficulty"
     5 = " 5 DKRF did by self in  last month/difficulty"
     6 = " 6 Did by self in last month/DKRF difficulty"
     7 = " 7 DKRF did by self in last month/DKRF difficulty"
    -1 = "-1 Inapplicable"
    -9 = '-9 Missing';

    VALUE MODINDEV
     8 = " 8 Not done in last month"
     1 = " 1 No use of devices inside in last month"
     2 = " 2 Use of devices inside in last month"
     3 = " 3 DKRF if used devices inside in last month"
     4 = " 4 DKRF on use of devices "
    -1 = "-1 Inapplicable ";

    VALUE MODINHLP
     8 = " 8 Not done in last month"
     1 = " 1 No help to go around inside in last month"
     2 = " 2 Had help to go around inside in last month"
     3 = " 3 DKRF if had help to go around inside in last month"
    -1 = "-1 Inapplicable";

     VALUE MDBEDSLF
     8 = " 8 Not done in last month"
     1 = " 1 Did not do by self in last month"
     2 = " 2 Did by self in last month/no difficulty"
     3 = " 3 Did by self in last month/difficulty"
     4 = " 4 DKRF did by self in last month/no difficulty"
     5 = " 5 DKRF did by self in  last month/difficulty"
     6 = " 6 Did by self in last month/DKRF difficulty"
     7 = " 7 DKRF did by self in last month/DKRF difficulty"
    -1 = "-1 Inapplicable"
    -9 = '-9 Missing';

    VALUE MDBEDDEV
     1 = " 1 No use of cane or walker to get out of bed in last month"
     2 = " 2 Use of cane or walker to get out of bed in last month"
     3 = " 3 DKRF if used cane or walker to get out of bed in last month "
     4 = " 4 DKRF if used cane or walker in last month"
    -1 = "-1 Inapplicable ";

     VALUE MDBEDHLP
     1 = " 1 No help to get out of bed in last month"
     2 = " 2 Had help to get out of bed in last month"
     3 = " 3 DKRF if had help to get out of bed in last month"
    -1 = "-1 Inapplicable" ;

     VALUE DMDHLPYR
     1 = " 1 No mobility help in last year"
     2 = " 2 Mobility help in last year"
    -7 = " -7 RF"
    -8 = " -8 DK"
    -1 = " -1 Inapplicable ";

     VALUE DMDHLPST
      0 = ' 0 less than 1 month of help'
      1 = ' 1 1 month of help'
      2 = ' 2 2 months of help'
      3 = ' 3 3 months of help'
      4 = ' 4 4 months of help'
      5 = ' 5 5 months of help'
      6 = ' 6 6 months of help'
      7 = ' 7 7 months of help'
      8 = ' 8 8 months of help'
      9 = ' 9 9 months of help'
     10 = '10 10 months of help'
     11 = '11 11 months of help'
     -7 = '-7 help last month but RF number of months of help in year'
     -8 = '-8 help last month but DK number of months of help in year'
    -1 = " -1 Inapplicable ";

     VALUE DMDHLPEN
      0 = ' 0 less than 1 month since help ended'
      1 = ' 1 1 month since help ended'
      2 = ' 2 2 months since help ended'
      3 = ' 3 3 months since help ended'
      4 = ' 4 4 months since help ended'
      5 = ' 5 5 months since help ended'
      6 = ' 6 6 months since help ended'
      7 = ' 7 7 months since help ended'
      8 = ' 8 8 months since help ended'
      9 = ' 9 9 months since help ended'
     10 = '10 10 months since help ended'
     11 = '11 11 months since help ended'
     -7 = '-7 no help last month and RF number of months since help ended'
     -8 = '-8 no help last month and DK number of months since help ended'
     -1 = '-1 Inapplicable ';

    VALUE DMHLPYRS
     0   = '0 none or less than 1 year'
     997 = '997 since birth'
     -7  = '-7 RF'
     -8  = '-8 DK'
     -1  = '-1 Inapplicable '
     -9  = '-9 Missing';

     VALUE DMDDEVYR
      1 = ' 1 No Mobility device use in last year'
      2 = ' 2 Mobility device use in last year'
     -1 = '-1 Inapplicable '
     -7  = '-7 RF'
     -8  = '-8 DK'
     -9 = '-9 Missing';

    VALUE DMDEVST
     0 = ' 0 less than 1 month of mobility device use'
     1 = ' 1 1 month of mobility device use'
     2 = ' 2 2 months of mobility device use'
     3 = ' 3 3 months of mobility device use'
     4 = ' 4 4 months of mobility device use'
     5 = ' 5 5 months of mobility device use'
     6 = ' 6 6 months of mobility device use'
     7 = ' 7 7 months of mobility device use'
     8 = ' 8 8 months of mobility device use'
     9 = ' 9 9 months of mobility device use'
    10 = '10 10 months of mobility device use'
    11 = '11 11 months of mobility device use'
    -7 = '-7 used last month but RF number of months of use in year'
    -8 = '-8 used last month but DK number of months of use in year'
    -1 = '-1 Inapplicable ';

     VALUE DMDEVEND
     1 = ' 1 1 month since mobility device use ended'
     2 = ' 2 2 months since mobility device use ended'
     3 = ' 3 3 months since mobility device use ended'
     4 = ' 4 4 months since mobility device use ended'
     5 = ' 5 5 months since mobility device use ended'
     6 = ' 6 6 months since mobility device use ended'
     7 = ' 7 7 months since mobility device use ended'
     8 = ' 8 8 months since mobility device use ended'
     9 = ' 9 9 months since mobility device use ended'
    10 = '10 10 months since mobility device use ended'
    11 = '11 11 months since mobility device use ended'
    -7 = '-7 no use last month and RF number of months since device use ended'
    -8 = '-8 no use last month and DK number of months since device use ended'
    -1 = '-1 Inapplicable '
  ;

    VALUE DMDEVYRS
     0   = '0  none or less than 1 year'
     997 = '997 since birth'
     -7  = '-7 DK'
     -8  = '-8 RF'
     -1  = '-1 Inapplicable '
     ;

    VALUE HADLSLF
    1 = ' 1  Did not do by self in last month'
    2 = ' 2  Did by self in last month/no difficulty'
    3 = ' 3  Did by self in last month/difficulty'
    4 = ' 4  DKRF did by self in last month/no difficulty'
    5 = ' 5  DKRF did by self in last month/difficulty'
    6 = ' 6  Did by self in last month/DKRF difficulty'
    7 = ' 7  DKRF did by self in last month/DKRF difficulty'
    8 = ' 8 Not done in last month'
   -1 = '-1 Inapplicable'    ;

       VALUE HADLOTH
    1 = ' 1 Health/functioning reason only'
    2 = ' 2 Other reason only'
    3 = ' 3 Both health/functioning and other reason'
    4 = ' 4 Service/someone from the place SP lives'
   -7 = '-7 RF'
   -8 = '-8 DK'
   -1 = '-1 Inapplicable'       ;

    VALUE HADSHSLF
    1 = ' 1 Did not do by self in last month'
    2 = ' 2 Did by self in last month/no difficulty'
    3 = ' 3 Did by self in last month/difficulty'
    4 = ' 4 DKRF did by self in last month/no difficulty'
    5 = ' 5 DKRF did by self in  last month/difficulty'
    6 = ' 6 Did by self in last month/DKRF difficulty'
    7 = ' 7 DKRF did by self in last month/DKRF difficulty'
    8 = ' 8 Not done in last month'
   -1 = '-1 Inapplicable'  ;

    VALUE HADSHOTH
     1 = ' 1 Health/functioning reason only'
     2 = ' 2 Other reason only'
     3 = ' 3 Both health/functioning and other reason'
     4 = ' 4 Service/someone from the place SP lives'
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable ';

    VALUE HADMLSLF
    1 = ' 1 Did not do by self in last month'
    2 = ' 2 Did by self in last month/no difficulty'
    3 = ' 3 Did by self in last month/difficulty'
    4 = ' 4 DKRF did by self in last month/no difficulty'
    5 = ' 5 DKRF did by self in  last month/difficulty'
    6 = ' 6 Did by self in last month/DKRF difficulty'
    7 = ' 7 DKRF did by self in last month/DKRF difficulty'
    8 = ' 8 Not done in last month'
   -1 = '-1 Inapplicable' ;

    VALUE HADMLOTH
     1 = ' 1 Health/functioning reason only'
     2 = ' 2 Other reason only'
     3 = ' 3 Both health/functioning and other reason'
     4 = ' 4 Service/someone from the place SP lives'
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing'        ;

    VALUE HADBBSLF
    1 = ' 1 Did not do by self in last month'
    2 = ' 2 Did by self in last month/no difficulty'
    3 = ' 3 Did by self in last month/difficulty'
    4 = ' 4 DKRF did by self in last month/no difficulty'
    5 = ' 5 DKRF did by self in  last month/difficulty'
    6 = ' 6 Did by self in last month/DKRF difficulty'
    7 = ' 7 DKRF did by self in last month/DKRF difficulty'
    8 = ' 8 Not done in last month'
    -1 = 'Inapplicable'     ;

    VALUE HADBBOTH
     1 = ' 1 Health/functioning reason only'
     2 = ' 2 Other reason only'
     3 = ' 3 Both health/functioning and other reason'
     4 = ' 4 Service/someone from the place SP lives'
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'  ;

    VALUE SCEATDEV
    1 = ' 1 No use of adapted utensils in last month'
    2 = ' 2 Use of adapted utensils in last month'
    3 = ' 3 RFDK if used adapted utensils in last month'
    8 = ' 8 Not done in last month'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'    ;

    VALUE SCEATHLP
     1 = ' 1 No help eating in last month'
     2 = ' 2 Help eating in last month'
     3 = ' 3 DKRF help eating in last month'
     8 = ' 8 Not done in last month'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing'    ;

    VALUE SCEATDIF
    1 = ' 1 Did not do by self in last month'
    2 = ' 2 No difficulty by self (and when using utensils)'
    3 = ' 3 Difficulty by self (and when using utensils)'
    6 = ' 6 Did by self in last month/DKRF difficulty'
    7 = ' 7 DKRF did by self in last month/DKRF difficulty'
    8 = ' 8 Not done in last month'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'    ;

    VALUE SCDBADEV
    1 = ' 1 No use of grab bars or bath seats in last month'
    2 = ' 2 Use of grab bars or bath seats in last month'
    3 = ' 3 DKRF if use of grab bars or bath seats in last month'
    4 = ' 4 DKRF if had grab bars or bath seats in last month'
    9 = ' 9 No grab bars or bath seats or washes up (does not shower or bathe) or has no shower or bathtub'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'    ;

    VALUE SCBTHHLP
    1 = ' 1 No help bathing in last month'
    2 = ' 2 Had help bathing in last month'
    3 = ' 3 DKRF if had help bathing in last month'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'    ;

    VALUE SCDBADIF
    1 = ' 1 Did not do by self in last month'
    2 = ' 2 No difficulty by self (and when using grab bars or tub seat)'
    3 = ' 3 Difficulty by self (and when using grab bars or tub seat)'
    6 = ' 6 Did by self in last month/DKRF difficulty '
    7 = ' 7 DKRF did by self in last month/DKRF difficulty'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'    ;

    VALUE SCTLTDEV
    1 = " 1 No use of toileting devices in last month"
    2 = " 2 Use of toileting devices in last month"
    3 = ' 3 DKRF of some and no use of other toileting devices in last month'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'    ;

    VALUE SCTLTHLP
    1 = ' 1 No help toileting in last month'
    2 = ' 2 Had help toileting in last month'
    3 = ' 3 DKRF if had help toileting in last month'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing';

    VALUE SCDTODIF
    1 = ' 1 Did not do by self in last month'
    2 = ' 2 No difficulty by self (and when using toileting devices)'
    3 = ' 3 Difficulty by self (and when using toileting devices)'
    6 = ' 6 Did by self in last month/DKRF difficulty'
    7 = ' 7 DKRF did by self in last month/DKRF difficulty'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing';

    VALUE DDRDEV
    1 = ' 1 No use of dressing devices in last month'
    2 = ' 2 Use of dressing devices in last month'
    3 = ' 3 DKRF if use of dressing devices in last month'
    8 = ' 8 Not done in last month '
    9 = ' 9 DKRF if dressed in last month'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing';

    VALUE DDRHLP
    1 = ' 1 No help dressing in last month'
    2 = ' 2 Had help dressing in last month'
    3 = ' 3 DKRF if had help dressing in last month'
    8 = ' 8 Not done in last month '
    9 = ' 9 DKRF if dressed in last month'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing';

    VALUE DDRDIF
    1 = ' 1 Did not do by self in last month'
    2 = ' 2 No difficulty by self (and when using dressing devices)'
    3 = ' 3 Difficulty by self (and when using dressing devices)'
    6 = ' 6 Did by self in last month/DKRF difficulty'
    7 = ' 7 DKRF did by self in last month/DKRF difficulty'
    8 = ' 8 Not done in last month'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing';

    VALUE DSDHLPYR
    1 = ' 1 No self care help in last year'
    2 = ' 2 Self care help in last year'
   -1 = '-1 Inapplicable'
   -7 = '-7 DK'
   -8 = '-8 RF'
   -9 = '-9 Missing';

    VALUE DHLPST
     0 = ' 0 - less than 1 month of self care help'
     1 = ' 1 - 1 month of self care help'
     2 = ' 2 - 2 months of self care help'
     3 = ' 3 - 3 months of self care help'
     4 = ' 4 - 4 months of self care help'
     5 = ' 5 - 5 months of self care help'
     6 = ' 6 - 6 months of self care help'
     7 = ' 7 - 7 months of self care help'
     8 = ' 8 - 8 months of self care help'
     9 = ' 9 - 9 months of self care help'
    10 = '10 - 10 months of self care help'
    11 = '11 - 11 months of self care help'
    -7 = '-7 - help in last month but RF number of months of help in last year'
    -8 = '-8 - help in last month but DK number of months of help in last year'
    -1 = '-1 - Inapplicable'
    -9 = '-9 - Missing';

    VALUE DHLPEND
     1 = ' 1 - 1 month since self care help ended'
     2 = ' 2 - 2 months since self care help ended'
     3 = ' 3 - 3 months since self care help ended'
     4 = ' 4 - 4 months since self care help ended'
     5 = ' 5 - 5 months since self care help ended'
     6 = ' 6 - 6 months since self care help ended'
     7 = ' 7 - 7 months since self care help ended'
     8 = ' 8 - 8 months since self care help ended'
     9 = ' 9 - 9 months since self care help ended'
    10 = '10 - 10 months since self care help ended'
    11 = '11 - 11 months since self care help ended'
    -7 = '-7 - no help last month and RF number of months since help ended'
    -8 = '-8 - no help last month and DK number of months since help ended'
    -1 = '-1 - Inapplicable'
    -9 = '-9 - Missing';

    VALUE DSHLPYRS
         0 = ' 0 None or less than 1 year of self care help'
        -7 = '-7 RF'
        -8 = '-8 DK'
        -1 = '-1 Inapplicable'
        -9 = '-9 Missing'      ;

    VALUE DPMSLF
    1 = ' 1 Did not do by self in last month'
    2 = ' 2 Did by self in last month/no difficulty'
    3 = ' 3 Did by self in last month/difficulty'
    4 = ' 4 DKRF did by self in last month/no difficulty'
    5 = ' 5 DKRF did by self in  last month/difficulty'
    6 = ' 6 Did by self in last month/DKRF difficulty'
    7 = ' 7 DKRF did by self in last month/DKRF difficulty'
    8 = ' 8 not done in last month'
    9 = ' 9 no or DKRF if medications taken in last month'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'    ;

    VALUE DFQTYPE
    0 = ' 0 Missing'
    2 = ' 2 Assisted Living or Continuing Care Retirement Community'
    3 = ' 3 Special care, memory care, Alzheimers unit'
    4 = ' 4 Nursing home'
    8 = ' 8 DKRF'
    9 = ' 9 Independent living or other'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing'    ;



    VALUE DPMOTH
        1 = ' 1 Health/functioning reason only'
        2 = ' 2 Other reason only'
        3 = ' 3 Both health/functioning and other'
        4 = ' 4 Service/someone from the place SP lives'
       -7 = '-7 RF'
       -8 = '-8 DK'
       -1 = '-1 Inapplicable'
       -9 = '-9 Missing'        ;

    /* PE BOOKLET */
    VALUE PE_STAT
        1 = '1 Booklet with recorded information on at least 1 test SP was eligible for
        (balance stands, walking course, chair stands, grip strength, peak air flow)'
        2 = ' 2 No recorded information'
       -1 = '-1 Inapplicable (nursing home or residential care FQ only)'
       -9 = '-9 Missing';

    VALUE BALSTAND
    0 = ' 0 Not eligible balance stands'
    1 = ' 1 Administer balance stands'
   -9 = '-9 Residential care with no SP interview'
   -1 = '-1 Inapplicable (nursing home resident)'    ;

    VALUE WALKADMN
    0 = ' 0 Not eligible walking'
    1 = ' 1 Administer walking'
   -1 = '-9 Inapplicable (nursing home resident)'
   -9 = '-1 Missing';

    VALUE CHSTAND
    0 = ' 0 Not eligible chair stands'
    1 = ' 1 Administer chair stands'
   -1 = '-9 Inapplicable (nursing home resident)'
   -9 = '-1 Missing';

    VALUE GRSTADMN
    0 = ' 0 Not eligible grip strength'
    1 = ' 1 Administer grip strength on right hand'
    2 = ' 2 Administer grip strength on left hand'
   -1 = '-1 Inapplicable (nursing home resident)'
   -9 = '-9 Missing';

    VALUE DWORK
    1 = ' 1 Works'
    2 = ' 2 Out of labor force including retired'
    3 = ' 3 Other'
   -7 = '-7 Missing';

    VALUE ELAGE2US
      0 = '  0 less than age 1'
    997 = '997 born in US'
     -7 = ' -7 DK'
     -8 = ' -8 RF'
     -1 = ' -1 Inapplicable'
     -9 = ' -9 Missing';

    VALUE DSAMERES
     1 = ' 1 Lives in same City and State as at age 15'
     2 = ' 2 Lives in same state but different City (or DKRF city) as age 15'
     3 = ' 3 Does not live in same State as age 15'
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing'    ;

    VALUE RACEHISP
        1 = ' 1 White, non-hispanic'
        2 = ' 2 Black, non-hispanic'
        3 = ' 3 Other (Am Indian/Asian/Native Hawaiian/Pacific Islander/other specify), non-Hispanic'
        4 = ' 4 Hispanic'
        5 = ' 5 more than one DKRF primary'
        6 = ' 6 DKRF'
       -9 = '-9 Missing';

    VALUE $DISP
          '10' = "10 Not Available "
          '11' = "11 Ready"
          '12' = "12 Started "
          '20' = "20 Final "
          '24' = "24 Not Required "
          '60' = "60 Complete "
          '61' = "61 Complete, NH facility"
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

    VALUE $STAT_DT
         '4' = " 4 April"
         '5' = " 5 May"
         '6' = " 6 June"
         '7' = " 7 July"
         '8' = " 8 August"
         '9' = " 9 September"
         '10' = "10 October"
         '11' = "11 November"
         '99' = "99 Prior to start of field work"
         '-1' = '-1 - Inapplicable';

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

    VALUE DOPAGE2C
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
      10 = "10 - 60-65"
      11 = "11 - 66-69"
      12 = "12 - 70-74"
      13 = "13 - 75-79"
      14 = "14 - 80-84"
      15 = "15 - 85-89"
      16 = "16 - 90 +"    ;

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

    VALUE DINTAGEC
      1 = "1 - 65-69"
      2 = "2 - 70-74"
      3 = "3 - 75-79"
      4 = "4 - 80-84"
      5 = "5 - 85-89"
      6 = "6 - 90 +"   ;

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

    VALUE W000001W
      12 = "12 STARTED"
      20 = "20 COMPLETE"
      21 = "21 INELIGIBLE - NOT 65+"    ;

    VALUE W000002W
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing'
     1 = " 1 MALE"
     2 = " 2 FEMALE"    ;

    VALUE W000003W
      1 = "1 Black"
      2 = "2 Hispanic"
      3 = "3 White"    ;

    VALUE W000004W
      12 = "12 Started"
      20 = "20 Complete"    ;

    VALUE W000005W
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing'
     1 = " 1 YES"
     2 = " 2 NO"    ;

    VALUE W000006W
      1 = "1 Person"
      2 = "2 Agency"    ;

    VALUE W000007W
      1 = "1 Yes"
      2 = "2 Do not change this person's details"
      3 = "3 Mark person for removal"    ;

    VALUE W000008W
       1 = " 1 - UNDER 20"
       2 = " 2 - 20-24"
       3 = " 3 - 25-29"
       4 = " 4 - 30-34"
       5 = " 5 - 35-39"
       6 = " 6 - 40-44"
       7 = " 7 - 45-49"
       8 = " 8 - 50-54"
       9 = " 9 - 55-59"
      10 = "10 - 60-65"
      11 = "11 - 66-69"
      12 = "12 - 70-74"
      13 = "13 - 75-79"
      14 = "14 - 80-85"
      15 = "15 - 86-89"
      16 = "16 - 90-94"
      17 = "17 - 95-99"
      18 = "18 - 100 +"    ;

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

    VALUE W000011W
      1 = " 1 HOME"
      2 = " 2 CELL PHONE"
      3 = " 3 WORK/OFFICE"
      4 = " 4 NEIGHBOR'S"
      5 = " 5 FRIEND'S"
      6 = " 6 RELATIVE'S"
     91 = "91 OTHER (SPECIFY)"   ;

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

    VALUE W000014W
      1 = " 1 SP AND/OR FAMILY"
      2 = " 2 GOVERNMENT PROGRAM"
      3 = " 3 INSURANCE"
     91 = "91 OTHER (SPECIFY)"    ;

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

    VALUE W000017W
      1 = "1 Yes"
      2 = "2 No"
      3 = "3 Refused"    ;

    VALUE W000018W
       5 = " 5 DAUGHTER-IN-LAW"
       6 = " 6 SON-IN-LAW"
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
      30 = "30 BOARDER/ RENTER"
      31 = "31 PAID AIDE/ HOUSEKEEPER/ EMPLOYEE"
      32 = "32 ROOMMATE"
      33 = "33 EX-WIFE/ EX-HUSBAND"
      34 = "34 BOYFRIEND/ GIRLFRIEND"
      35 = "35 NEIGHBOR"
      36 = "36 FRIEND"
      91 = "91 OTHER RELATIVE"
      92 = "92 OTHER NONRELATIVE"    ;

    VALUE W000019W
       5 = " 5 DAUGHTER-IN-LAW"
       6 = " 6 SON-IN-LAW"
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
      30 = "30 BOARDER/ RENTER"
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

    VALUE W000020W
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing'
      1 = "1 HOME"
      2 = "2 MULTI-UNIT"
      3 = "3 OTHER"    ;

    VALUE W000021W
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing'
     1 = " 1 BUILDING HAS ONE FLOOR"
     2 = " 2 BUILDING HAS MULTIPLE FLOORS"    ;

    VALUE W000022W
      1 = "1  REQUIRED"
     24 = "24 NOT REQUIRED"    ;

    VALUE W000023W
      1 = "1 NURSING HOME"
      2 = "2 OTHER FACILITY"    ;

    VALUE W000024W
      1 = " 1 HOME"
      2 = " 2 APARTMENT"
      3 = " 3 ROOM"
      4 = " 4 UNIT"
      5 = " 5 SUITE"
      6 = " 6 SOMETHING ELSE (SPECIFY)"    ;

    VALUE W000025W
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing'
      1 = "1 SAMPLE PERSON (SP)"
      2 = "2 PROXY"    ;

    VALUE W000026W
      1 = " 1 DEMENTIA OR COGNITIVE IMPAIRMENT REPORTED BY PROXY"
      2 = " 2 SP TOO ILL"
      3 = " 3 SP SPEECH IMPAIRED"
      4 = " 4 SP HEARING IMPAIRED"
      5 = " 5 LANGUAGE BARRIER"
      6 = " 6 TEMPORARILY UNAVAILABLE"
     91 = "91 OTHER (SPECIFY)"    ;

    VALUE W000027W
      1 = "1 CONSENT TO RECORDING"
      7 = "7 REFUSE CONSENT TO RECORD"    ;

    VALUE W000028W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
       1 = " 1 SELF"
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
      37 = "37 STAFF PERSON FROM THE PLACE SP LIVES"
      38 = "38 CO-WORKER"
      39 = "39 MINISTER, PRIEST, OR OTHER CLERGY"
      40 = "40 PSYCHIATRIST, PSYCHOLOGIST, COUNSELOR, OR THERAPIST"
      91 = "91 OTHER RELATIVE"
      92 = "92 OTHER NONRELATIVE"    ;

    VALUE W000029W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 VERY FAMILIAR"
      2 = " 2 SOMEWHAT FAMILIAR"
      3 = " 3 A LITTLE FAMILIAR"
      4 = " 4 NOT AT ALL FAMILIAR"    ;

    VALUE W000030W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 FREE-STANDING (DETACHED) SINGLE HOUSE"
      2 = " 2 SINGLE HOUSE BUT ATTACHED TO OTHERS (ROW HOUSE, TOWNHOUSE, DUPLEX, TRIPLEX, OR TRIPLE DECKER)"
      3 = " 3 MOBILE HOME OR TRAILER"
      4 = " 4 MULTI-UNIT (2+) BUILDING"
     91 = "91 OTHER (SPECIFY)"    ;

    VALUE W000031W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 EXCELLENT"
      2 = " 2 VERY GOOD"
      3 = " 3 GOOD"
      4 = " 4 FAIR"
      5 = " 5 POOR"    ;

    VALUE W000032W
      1 = " 1 SKIN CANCER"
      2 = " 2 BREAST CANCER"
      3 = " 3 PROSTATE CANCER"
      4 = " 4 BLADDER CANCER"
      5 = " 5 CERVICAL/OVARIAN/UTERINE CANCER"
      6 = " 6 COLON CANCER"
      7 = " 7 KIDNEY CANCER"
     91 = "91 OTHER TYPE OF CANCER"    ;

    VALUE W000033W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 NOT AT ALL"
      2 = " 2 SEVERAL DAYS"
      3 = " 3 MORE THAN HALF THE DAYS"
      4 = " 4 NEARLY EVERY DAY"    ;

    VALUE W000034W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 EVERY NIGHT"
      2 = " 2 MOST NIGHTS"
      3 = " 3 SOME NIGHTS"
      4 = " 4 RARELY"
      5 = " 5 NEVER"    ;

    VALUE W000035W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 EVERY NIGHT"
      2 = " 2 MOST NIGHTS "
      3 = " 3 SOME NIGHTS"
      4 = " 4 RARELY"
      5 = " 5 NEVER"
      7 = " 7 DON'T WAKE UP/NOT A PROBLEM"    ;

    VALUE W000036W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 MONTHS"
      2 = " 2 YEARS"    ;

    VALUE W000037W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 PRIVATE RESIDENCE"
      2 = " 2 A GROUP HOME, BOARD AND CARE, OR SUPERVISED HOUSING"
      3 = " 3 ASSISTED LIVING FACILITY OR CONTINUING CARE RETIREMENT COMMUNITY (CCRC)"
      4 = " 4 RELIGIOUS GROUP QUARTERS"
     91 = "91 OTHER (SPECIFY)"
    ;

    VALUE W000038W

     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 YES"
      2 = " 2 NO"
      7 = " 7 PLACE DOES NOT HAVE A NAME"    ;

    VALUE W000039W

     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 APARTMENT"
      2 = " 2 ROOM"
      3 = " 3 UNIT"
      4 = " 4 SUITE"
     91 = "91 SOMETHING ELSE (SPECIFY)"    ;

    VALUE W000040W

     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 PRIVATE RESIDENCE"
      2 = " 2 A GROUP HOME, BOARD AND CARE, OR SUPERVISED HOUSING"
      3 = " 3 ASSISTED LIVING FACILITY OR CONTINUING CARE RETIREMENT COMMUNITY (CCRC)"
      5 = " 5 NURSING HOME"
     91 = "91 OTHER (SPECIFY)"    ;

    VALUE W000041W
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
      30 = "30 BOARDER/ RENTER"
      31 = "31 PAID AIDE/ HOUSEKEEPER/ EMPLOYEE"
      32 = "32 ROOMMATE"
      33 = "33 EX-WIFE/ EX-HUSBAND"
      34 = "34 BOYFRIEND/ GIRLFRIEND"
      36 = "36 FRIEND"
      91 = "91 OTHER RELATIVE"
      92 = "92 OTHER NONRELATIVE"    ;

    VALUE W000042W
      3 = "3 DAUGHTER"
      4 = "4 SON"
      7 = "7 STEPDAUGHTER"
      8 = "8 STEPSON"    ;

    VALUE W000043W
       1 = " 1 SocialNetwork: Person 1"
       2 = " 2 SocialNetwork: Person 2"
       3 = " 3 SocialNetwork: Person 3"
       4 = " 4 SocialNetwork: Person 4"
       5 = " 5 SocialNetwork: Person 5"
       6 = " 6 SocialNetwork: Person 6"
       7 = " 7 SocialNetwork: Person 7"
       8 = " 8 SocialNetwork: Person 8"
       9 = " 9 SocialNetwork: Person 9"
      10 = "10 SocialNetwork: Person 10"
      11 = "11 SocialNetwork: Person 11"
      12 = "12 SocialNetwork: Person 12"
      13 = "13 SocialNetwork: Person 13"
      14 = "14 SocialNetwork: Person 14"
      15 = "15 SocialNetwork: Person 15"
      16 = "16 SocialNetwork: Person 16"
      17 = "17 SocialNetwork: Person 17"
      18 = "18 SocialNetwork: Person 18"
      19 = "19 SocialNetwork: Person 19"
      20 = "20 SocialNetwork: Person 20"
      21 = "21 SocialNetwork: Person 21"
      22 = "22 SocialNetwork: Person 22"    ;

    VALUE W000044W
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing'
     1 = " 1 COMMON OR SHARED ENTRANCE"
     2 = " 2 ENTRANCE DIRECTLY INTO HOME"    ;

    VALUE W000045W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 - 1"
      2 = " 2 - 2"
      3 = " 3 - 3"
      4 = " 4 - 4+"    ;

    VALUE W000046W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 ALL ITEMS HERE"
      2 = " 2 ADDED ONE OR MORE ITEMS"    ;

    VALUE W000047W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 MORE THAN $500"
      2 = " 2 LESS THAN $500"
      3 = " 3 JUST ABOUT $500"    ;

    VALUE W000048W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 MORE THAN $1,000"
      2 = " 2 LESS THAN $1,000"
      3 = " 3 JUST ABOUT $1,000"    ;

    VALUE W000049W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 MORE THAN $100"
      2 = " 2 LESS THAN $100"
      3 = " 3 JUST ABOUT $100"    ;

    VALUE W000050W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 YES"
      2 = " 2 NO"
      7 = " 7 YES, DOESNT KNOW HOW TO USE A COMPUTER"    ;

    VALUE W000051W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 MOST DAYS"
      2 = " 2 SOME DAYS"
      3 = " 3 RARELY"    ;

    VALUE W000052W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 EXCELLENT"
      2 = " 2 VERY GOOD"
      3 = " 3 GOOD"
      4 = " 4 FAIR"
      5 = " 5 POOR"    ;

    VALUE W000053W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 YES"
      2 = " 2 NO"
      7 = " 7 DEAF"    ;

    VALUE W000054W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 YES"
      2 = " 2 NO"
      7 = " 7 BLIND"    ;

    VALUE W000055W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 EVERY DAY (7 DAYS A WEEK)"
      2 = " 2 MOST DAYS (5-6 DAYS A WEEK)"
      3 = " 3 SOME DAYS (2-4 DAYS A WEEK)"
      4 = " 4 RARELY (ONCE A WEEK OR LESS)"
      5 = " 5 NEVER"    ;

    VALUE W000056W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 BACK"
      2 = " 2 HIPS"
      3 = " 3 KNEES"
      4 = " 4 FEET"
      5 = " 5 HANDS"
      6 = " 6 WRISTS"
      7 = " 7 SHOULDERS"
      8 = " 8 HEAD"
      9 = " 9 NECK"
     10 = "10 ARMS"
     11 = "11 LEGS"
     12 = "12 STOMACH"
     91 = "91 OTHER PLACES (SPECIFY)"    ;

    VALUE W000057W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 YES, A CHANGE"
      2 = " 2 NO, NO CHANGE"
      3 = " 3 DEMENTIA/ALZHEIMER'S REPORTED BY PROXY"    ;

    VALUE W000058W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 SP HAS DEMENTIA/ALZHEIMER'S/ NOT ABLE"
      2 = " 2 SP IS UNABLE TO SPEAK"
      3 = " 3 SP IS UNABLE TO HEAR"
      4 = " 4 SP REFUSED"
      5 = " 5 PROXY REFUSED"
      6 = " 6 SP NOT PRESENT"
      7 = " 7 SP TOO ILL"
      8 = " 8 SP LANGUAGE BARRIER"
     91 = "91 OTHER (SPECIFY)"    ;

    VALUE W000059W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 MUCH BETTER"
      2 = " 2 BETTER"
      3 = " 3 SAME"
      4 = " 4 WORSE"
      5 = " 5 MUCH WORSE"    ;

    VALUE W000060W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 YES"
      2 = " 2 NO/DON'T KNOW"    ;

    VALUE W000061W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 CONTINUE WITH ACTIVITY"
      2 = " 2 SP REFUSES ACTIVITY"    ;

    VALUE W000062W
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 Word[1]"
      2 = " 2 Word[2]"
      3 = " 3 Word[3]"
      4 = " 4 Word[4]"
      5 = " 5 Word[5]"
      6 = " 6 Word[6]"
      7 = " 7 Word[7]"
      8 = " 8 Word[8]"
      9 = " 9 Word[9]"
     10 = "10 Word[10]"
     91 = "91 NO WORDS REMEMBERED"
     92 = "92 REFUSED"    ;

    VALUE W000063W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 DIFFICULTY HEARING ANY OF THE WORDS"
      2 = " 2 INTERRUPTION OCCURRED WHILE LIST WAS BEING READ"
     91 = "91 OTHER PROBLEM (SPECIFY)"
     92 = "92 NO PROBLEMS OCCURRED"    ;

    VALUE W000064W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 SP ATTEMPTED CLOCK DRAWING"
      2 = " 2 SP DID NOT ATTEMPT CLOCK DRAWING"
     97 = "97 SP REFUSED CLOCK DRAWING"    ;

    VALUE W000065W
      1 = "1 LAST NAME CORRECT"
      2 = "2 LAST NAME NOT CORRECT/DK LAST NAME"
      3 = "3 FIRST NAME CORRECT"
      4 = "4 FIRST NAME NOT CORRECT/DK FIRST NAME"    ;

    VALUE W000066W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 EVERY DAY (7 DAYS A WEEK)"
      2 = " 2 MOST DAYS (5-6 DAYS A WEEK)"
      3 = " 3 SOME DAYS (2-4 DAYS A WEEK)"
      4 = " 4 RARELY (ONCE A WEEK OR LESS)"
      5 = " 5 NEVER"    ;

    VALUE W000067W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 EVERY TIME"
      2 = " 2 MOST TIMES"
      3 = " 3 SOMETIMES"
      4 = " 4 RARELY"
      5 = " 5 NEVER"    ;

    VALUE W000068W
       1 = " 1 HelperMember: Person 1"
       2 = " 2 HelperMember: Person 2"
       3 = " 3 HelperMember: Person 3"
       4 = " 4 HelperMember: Person 4"
       5 = " 5 HelperMember: Person 5"
       6 = " 6 HelperMember: Person 6"
       7 = " 7 HelperMember: Person 7"
       8 = " 8 HelperMember: Person 8"
       9 = " 9 HelperMember: Person 9"
      10 = "10 HelperMember: Person 10"
      11 = "11 HelperMember: Person 11"
      12 = "12 HelperMember: Person 12"
      13 = "13 HelperMember: Person 13"
      14 = "14 HelperMember: Person 14"
      15 = "15 HelperMember: Person 15"
      16 = "16 HelperMember: Person 16"
      17 = "17 HelperMember: Person 17"
      18 = "18 HelperMember: Person 18"
      19 = "19 HelperMember: Person 19"
      20 = "20 HelperMember: Person 20"
      21 = "21 HelperMember: Person 21"
      22 = "22 HelperMember: Person 22"
      23 = "23 HelperMember: Person 23"
      24 = "24 HelperMember: Person 24"
      25 = "25 HelperMember: Person 25"    ;

    VALUE W000069W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 MOST TIMES"
      2 = " 2 SOMETIMES"
      3 = " 3 RARELY"
      4 = " 4 NEVER"    ;

    VALUE W000070W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 NONE"
      2 = " 2 A LITTLE"
      3 = " 3 SOME"
      4 = " 4 A LOT"    ;

    VALUE W000071W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 MORE OFTEN"
      2 = " 2 LESS OFTEN"
      3 = " 3 ABOUT THE SAME"    ;

    VALUE W000072W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 YES, A YEAR OR MORE"
      2 = " 2 NO, LESS THAN A YEAR"    ;

    VALUE W000073W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 JANUARY"
      2 = " 2 FEBRUARY"
      3 = " 3 MARCH"
      4 = " 4 APRIL"
      5 = " 5 MAY"
      6 = " 6 JUNE"
      7 = " 7 JULY"
      8 = " 8 AUGUST"
      9 = " 9 SEPTEMBER"
     10 = "10 OCTOBER"
     11 = "11 NOVEMBER"
     12 = "12 DECEMBER"    ;

    VALUE W000074W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 MONTH AND YEAR"
      2 = " 2 NUMBER OF MONTHS AGO"
      3 = " 3 NUMBER OF YEARS AGO"
      4 = " 4 AGE WHEN LAST DROVE"
      7 = " 7 NEVER DROVE"    ;

    VALUE W000075W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 YES"
      2 = " 2 NO"
      7 = " 7 {NO, NO RAIN OR BAD WEATHER}"    ;

    VALUE W000076W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 ALWAYS DID IT BY SELF"
      2 = " 2 ALWAYS DID IT TOGETHER WITH SOMEONE ELSE"
      3 = " 3 SOMEONE ELSE ALWAYS DID IT"
      4 = " 4 IT VARIED (MORE THAN ONE WAY)"
      5 = " 5 NOT DONE IN LAST MONTH"    ;

    VALUE W000077W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 MACHINE IN HOME"
      2 = " 2 MACHINE ELSEWHERE IN BUILDING"
      3 = " 3 LAUNDROMAT"
      4 = " 4 SINK IN HOME"
      5 = " 5 SINK ELSEWHERE IN BUILDING"
     91 = "91 OTHER (SPECIFY)"    ;

    VALUE W000078W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 HEALTH OR FUNCTIONING (INCLUDES AGE, MEMORY, VISION, HEALTH CONDITION/DISEASE NAMES, SURGERY, UNABLE TO DRIVE)"
      2 = " 2 OTHER REASON (INCLUDES SHARED ACTIVITY, ALWAYS DONE THIS WAY, SOMEONE ELSE WANTED TO DO IT, PAY SOMEONE, DOESNT LIKE TO D"
    ;

    VALUE W000079W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 MORE OFTEN"
      2 = " 2 LESS OFTEN"
      3 = " 3 SAME"    ;

    VALUE W000080W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 CASH"
      2 = " 2 CHECK"
      3 = " 3 DEBIT OR GIFT CARD"
      4 = " 4 CREDIT CARD"
      5 = " 5 FOOD STAMPS"
      6 = " 6 SOMEONE ELSE PAYS"
     91 = "91 OTHER"    ;

    VALUE W000081W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 {DROVE}"
      2 = " 2 GOT A RIDE FROM A FAMILY MEMBER OR FRIEND OR SOMEONE PAID TO HELP"
      3 = " 3 {USED A VAN OR SHUTTLE SERVICE PROVIDED BY THE PLACE SP LIVES}"
      4 = " 4 USED A VAN OR SHUTTLE SERVICE FOR PEOPLE WITH DISABILITIES OR SENIORS {NOT PROVIDED BY THE PLACE SP LIVES}"
      5 = " 5 TOOK PUBLIC TRANSPORTATION (THE BUS, SUBWAY, TRAIN, OR TRAM)"
      6 = " 6 TOOK A TAXI"
      7 = " 7 WALKED"
      8 = " 8 HOME VISIT"
     91 = "91 OTHER (SPECIFY)"    ;

    VALUE W000082W
       1 = " 1 HelperMeals: Person 1"
       2 = " 2 HelperMeals: Person 2"
       3 = " 3 HelperMeals: Person 3"
       4 = " 4 HelperMeals: Person 4"
       5 = " 5 HelperMeals: Person 5"
       6 = " 6 HelperMeals: Person 6"
       7 = " 7 HelperMeals: Person 7"
       8 = " 8 HelperMeals: Person 8"
       9 = " 9 HelperMeals: Person 9"
      10 = "10 HelperMeals: Person 10"
      11 = "11 HelperMeals: Person 11"
      12 = "12 HelperMeals: Person 12"
      13 = "13 HelperMeals: Person 13"
      14 = "14 HelperMeals: Person 14"
      15 = "15 HelperMeals: Person 15"
      16 = "16 HelperMeals: Person 16"
      17 = "17 HelperMeals: Person 17"
      18 = "18 HelperMeals: Person 18"
      19 = "19 HelperMeals: Person 19"
      20 = "20 HelperMeals: Person 20"
      21 = "21 HelperMeals: Person 21"
      22 = "22 HelperMeals: Person 22"
      23 = "23 HelperMeals: Person 23"
      24 = "24 HelperMeals: Person 24"
      25 = "25 HelperMeals: Person 25"    ;

    VALUE W000083W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 YES"
      2 = " 2 NO"
      7 = " 7 ALWAYS FED THROUGH IV OR TUBE"    ;

    VALUE W000084W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 EVERY TIME"
      2 = " 2 MOST TIMES"
      3 = " 3 SOMETIMES"
      4 = " 4 RARELY"    ;

    VALUE W000085W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 SHOWERED"
      2 = " 2 TOOK BATHS IN A TUB"
      3 = " 3 WASHED UP SOME OTHER WAY"    ;

    VALUE W000086W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 {SHOWERING}"
      2 = " 2 {TAKING BATHS}"
      3 = " 3 {WASHING UP SOME OTHER WAY}"    ;

    VALUE W000087W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 LOCAL STORE OR PHARMACY"
      2 = " 2 BY MAIL"
      3 = " 3 HEALTHCARE PROVIDER/HOSPITAL"
     91 = "91 SOMEWHERE ELSE (SPECIFY)"    ;

    VALUE W000088W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 PICKED THEM UP BY SELF"
      2 = " 2 HAD THEM DELIVERED"
      3 = " 3 HAD SOMEONE ELSE PICK THEM UP"    ;

    VALUE W000089W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 ^fdrove"
      2 = " 2 GOT A RIDE FROM A FAMILY MEMBER OR FRIEND OR SOMEONE PAID TO HELP"
      3 = " 3 ^fservice"
      4 = " 4 ^fnotprov"
      5 = " 5 TOOK PUBLIC TRANSPORTATION (THE BUS, SUBWAY, TRAIN, OR TRAM)"
      6 = " 6 TOOK A TAXI"
     91 = "91 OTHER (SPECIFY)"    ;

    VALUE W000090W
       1 = " 1 HelperSatInwDoctor: Person 1"
       2 = " 2 HelperSatInwDoctor: Person 2"
       3 = " 3 HelperSatInwDoctor: Person 3"
       4 = " 4 HelperSatInwDoctor: Person 4"
       5 = " 5 HelperSatInwDoctor: Person 5"
       6 = " 6 HelperSatInwDoctor: Person 6"
       7 = " 7 HelperSatInwDoctor: Person 7"
       8 = " 8 HelperSatInwDoctor: Person 8"
       9 = " 9 HelperSatInwDoctor: Person 9"
      10 = "10 HelperSatInwDoctor: Person 10"
      11 = "11 HelperSatInwDoctor: Person 11"
      12 = "12 HelperSatInwDoctor: Person 12"
      13 = "13 HelperSatInwDoctor: Person 13"
      14 = "14 HelperSatInwDoctor: Person 14"
      15 = "15 HelperSatInwDoctor: Person 15"
      16 = "16 HelperSatInwDoctor: Person 16"
      17 = "17 HelperSatInwDoctor: Person 17"
      18 = "18 HelperSatInwDoctor: Person 18"
      19 = "19 HelperSatInwDoctor: Person 19"
      20 = "20 HelperSatInwDoctor: Person 20"
      21 = "21 HelperSatInwDoctor: Person 21"
      22 = "22 HelperSatInwDoctor: Person 22"
      23 = "23 HelperSatInwDoctor: Person 23"
      24 = "24 HelperSatInwDoctor: Person 24"
      25 = "25 HelperSatInwDoctor: Person 25"    ;

    VALUE W000091W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 VERY IMPORTANT"
      2 = " 2 SOMEWHAT IMPORTANT"
      3 = " 3 NOT SO IMPORTANT"    ;

    VALUE W000092W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 YES"
      2 = " 2 NO"
      3 = " 3 CAN'T DO/DON'T DO"    ;

    VALUE W000093W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 LEFT"
      2 = " 2 RIGHT"
      3 = " 3 BOTH"    ;

    VALUE W000094W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 LEFT SIDE"
      2 = " 2 RIGHT SIDE"
      3 = " 3 BOTH SIDES"    ;

    VALUE W000095W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 ONE SIDE"
      2 = " 2 BOTH SIDES"    ;

    VALUE W000096W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 WELL OFF"
      2 = " 2 ABOVE AVERAGE"
      3 = " 3 AVERAGE"
      4 = " 4 BELOW AVERAGE"
      5 = " 5 POOR"    ;

    VALUE W000097W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 MOTHER ONLY"
      2 = " 2 FATHER ONLY"
      3 = " 3 ANOTHER RELATIVE"
      4 = " 4 NON-RELATIVES"
      5 = " 5 VARIED/MOVED AROUND"    ;

    VALUE W000098W
       1 = " 1 Contact: Person 1"
       2 = " 2 Contact: Person 2"
       3 = " 3 Contact: Person 3"
       4 = " 4 Contact: Person 4"
       5 = " 5 Contact: Person 5"
       6 = " 6 Contact: Person 6"
       7 = " 7 Contact: Person 7"
       8 = " 8 Contact: Person 8"
       9 = " 9 Contact: Person 9"
      10 = "10 Contact: Person 10"
      11 = "11 Contact: Person 11"
      12 = "12 Contact: Person 12"
      13 = "13 Contact: Person 13"
      14 = "14 Contact: Person 14"
      15 = "15 Contact: Person 15"
      16 = "16 Contact: Person 16"
      17 = "17 Contact: Person 17"
      18 = "18 Contact: Person 18"
      19 = "19 Contact: Person 19"
      20 = "20 Contact: Person 20"
      21 = "21 Contact: Person 21"
      22 = "22 Contact: Person 22"    ;

    VALUE W000099W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 AGREE A LOT"
      2 = " 2 AGREE A LITTLE"
      3 = " 3 DO NOT AGREE"    ;

    VALUE W000100W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 WHITE/CAUCASIAN"
      2 = " 2 BLACK/AFRICAN AMERICAN"
      3 = " 3 AMERICAN INDIAN"
      4 = " 4 ALASKA NATIVE"
      5 = " 5 ASIAN"
      6 = " 6 NATIVE HAWAIIAN"
      7 = " 7 PACIFIC ISLANDER"
      8 = " 8 OTHER (SPECIFY)"    ;

    VALUE W000101W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 {WHITE}"
      2 = " 2 {BLACK}"
      3 = " 3 {AMERICAN INDIAN}"
      4 = " 4 {ALASKAN NATIVE}"
      5 = " 5 {ASIAN}"
      6 = " 6 {NATIVE HAWAIIAN}"
      7 = " 7 {PACIFIC ISLANDER}"
      8 = " 8 {OTHER}"    ;

    VALUE W000102W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 MEXICAN AMERICAN/CHICANO"
      2 = " 2 PUERTO RICAN"
      3 = " 3 CUBAN AMERICAN"
      4 = " 4 OTHER (SPECIFY)"    ;

    VALUE W000103W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 VERY WELL"
      2 = " 2 WELL"
      3 = " 3 NOT WELL"
      4 = " 4 NOT AT ALL"    ;

    VALUE W000104W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 NOVEMBER 1941 OR EARLIER"
      2 = " 2 WORLD WAR II (DECEMBER 1941-DECEMBER 1946)"
      3 = " 3 JANUARY 1947 - JUNE 1950"
      4 = " 4 KOREAN WAR (JULY 1950 - JANUARY 1955)"
      5 = " 5 FEBRUARY 1955 - JULY 1964"
      6 = " 6 VIETNAM ERA (AUGUST 1964 - APRIL 1975)"
      7 = " 7 MAY 1975 - JULY 1990"
      8 = " 8 AUGUST 1990 - AUGUST 2001 (INCLUDING PERSIAN GULF WAR)"
      9 = " 9 SEPTEMBER 2001 OR LATER"    ;

    VALUE W000105W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 AGREE A LOT"
      2 = " 2 AGREE A LITTLE"
      3 = " 3 AGREE NOT AT ALL"    ;

    VALUE W000106W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 NURSING HOME CARE"
      2 = " 2 ASSISTED LIVING"
      3 = " 3 CARE BY HOME HEALTH PROVIDERS IN HOME"    ;

    VALUE W000107W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $1,000,"
      2 = " 2 $1,000 to less than $2,000,"
      3 = " 3 $2,000 to less than $3,000,"
      4 = " 4 $3,000 to less than $5,000, or"
      5 = " 5 $5,000 or more?"    ;

    VALUE W000108W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 NUMBER OF YEARS"
      2 = " 2 AGE"    ;

    VALUE W000109W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 YES"
      2 = " 2 NO"
      3 = " 3 RETIRED/DON'T WORK ANYMORE"    ;

    VALUE W000110W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 EVERY WEEK"
      2 = " 2 EVERY TWO WEEKS"
      3 = " 3 TWO TIMES A MONTH"
      4 = " 4 OTHER SCHEDULE (SPECIFY)"    ;

    VALUE W000111W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 ENTER PAYCHECK AMOUNT"
      2 = " 2 ENTER PAY PER HOUR"
      3 = " 3 ENTER PAY PER DAY"    ;

    VALUE W000112W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 ENTER OCCUPATION"
      2 = " 2 NEVER WORKED ENTIRE LIFE"
      3 = " 3 HOMEMAKER/RAISED CHILDREN/WORKED IN THE HOME"    ;

    VALUE W000113W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 SAME KIND OF WORK"
      2 = " 2 SOMETHING DIFFERENT"    ;

    VALUE W000114W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 OWN"
      2 = " 2 RENT"
      3 = " 3 SOME OTHER ARRANGEMENT"    ;

    VALUE W000115W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 PAID OFF"
      2 = " 2 STILL MAKE PAYMENTS"
      3 = " 3 REVERSE MORTGAGE"    ;

    VALUE W000116W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $250,"
      2 = " 2 $250-$499,"
      3 = " 3 $500-$999, or"
      4 = " 4 $1,000 or more?"    ;

    VALUE W000117W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 5 YEARS"
      2 = " 2 10 YEARS"
      3 = " 3 LONGER THAN 10 YEARS"    ;

    VALUE W000118W

     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $50,000,"
      2 = " 2 between $50,000 and $100,000, or"
      3 = " 3 over $100,000?"    ;

    VALUE W000119W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $50,000,"
      2 = " 2 $50,000-$74,999,"
      3 = " 3 $75,000-$99,999,"
      4 = " 4 $100,000-$199,999,"
      5 = " 5 $200,000-$299,999,"
      6 = " 6 $300,000-$499,999,"
      7 = " 7 $500,000-$749,999, or"
      8 = " 8 $750,000 or more?"    ;

    VALUE W000120W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 YES, SP RECEIVED PAYMENT FROM SOURCE"
      2 = " 2 ^HH.fOption2Response"
      3 = " 3 NO PAYMENT RECEIVED FROM THIS SOURCE"    ;

    VALUE W000121W
    -7 = '-7 RF'
    -8 = '-8 DK'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing'
     1 = " 1 MAIL"
     2 = " 2 DIRECT DEPOSIT"    ;

    VALUE W000122W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 YES, SP HAS 401K, 403B, IRA, OR KEOGH"
      2 = " 2 ^HH.fOption2ResponseIA7"
      3 = " 3 NO ACCOUNTS OF THIS TYPE"   ;

    VALUE W000123W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 YES, SP HAS ASSET"
      2 = " 2 ^HH.fOption2ResponseIA8"
      3 = " 3 ^HH.fOption3Response"
      4 = " 4 NO ASSET OF THIS TYPE"    ;

    VALUE W000124W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 YES, SP HAS ASSET"
      2 = " 2 ^HH.fOption2ResponseIA8"
      3 = " 3 ^HH.fOption3Response"
      4 = " 4 NO ASSETS OF THIS TYPE"    ;

    VALUE W000125W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 ENTER COMBINED AMOUNT"
      2 = " 2 ENTER SP AND SPOUSE/PARTNER AMOUNTS SEPARATELY"    ;

    VALUE W000126W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $1,200,"
      2 = " 2 $1,200-$1,599,"
      3 = " 3 $1,600-$1,999,"
      4 = " 4 $2,000-$2,499, or"
      5 = " 5 $2,500 or more?"    ;

    VALUE W000127W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $600,"
      2 = " 2 $600-$899,"
      3 = " 3 $900-$1,099,"
      4 = " 4 $1,100-$1,499, or"
      5 = " 5 $1,500 or more?"    ;

    VALUE W000128W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $300,"
      2 = " 2 $300-$699,"
      3 = " 3 $700-$999, or"
      4 = " 4 $1000 or more?"    ;

    VALUE W000129W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $100,"
      2 = " 2 $100-$199,"
      3 = " 3 $200-$399,"
      4 = " 4 $400-$699, or"
      5 = " 5 $700 or more?"    ;

    VALUE W000130W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $600,"
      2 = " 2 $600-$799,"
      3 = " 3 $800-$999,"
      4 = " 4 $1000-$1199, or"
      5 = " 5 $1200 or more?"    ;

    VALUE W000131W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $500,"
      2 = " 2 $500-$699,"
      3 = " 3 $700-$899,"
      4 = " 4 $900-$1,099, or"
      5 = " 5 $1,100 or more?"    ;

    VALUE W000132W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $600,"
      2 = " 2 $600-$1,099,"
      3 = " 3 $1,100-$2,099,"
      4 = " 4 $2,100-$4,499, or"
      5 = " 5 $4,500 or more?"    ;

    VALUE W000133W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $400,"
      2 = " 2 $400-$799,"
      3 = " 3 $800-$1,499,"
      4 = " 4 $1,500-$3,399, or"
      5 = " 5 $3,400 or more?"    ;

    VALUE W000134W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $16,000,"
      2 = " 2 $16,000-$49,999,"
      3 = " 3 $50,000-$118,999,"
      4 = " 4 $119,000-$224,999, or"
      5 = " 5 $225,000 or more?"    ;

    VALUE W000135W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $10,000,"
      2 = " 2 $10,000-$27,999,"
      3 = " 3 $28,000-$54,999,"
      4 = " 4 $55,000-$143,999, or"
      5 = " 5 $144,000 or more?"    ;

    VALUE W000136W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $200,"
      2 = " 2 $200-$299,"
      3 = " 3 $300-$699,"
      4 = " 4 $700-$1,499, or"
      5 = " 5 $1,500 or more?"    ;

    VALUE W000137W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $100,"
      2 = " 2 $100-$199,"
      3 = " 3 $200-$399,"
      4 = " 4 $400-$1,099, or"
      5 = " 5 $1,100 or more?"    ;

    VALUE W000138W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $2,400,"
      2 = " 2 $2,400-$3,599,"
      3 = " 3 $3,600-$8,399,"
      4 = " 4 $8,400-$17,999, or"
      5 = " 5 $18,000 or more?"    ;

    VALUE W000139W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $1,200,"
      2 = " 2 $1,200-$2,399,"
      3 = " 3 $2,400-$4,799,"
      4 = " 4 $4,800-$13,199, or"
      5 = " 5 $13,200 or more?"    ;

    VALUE W000140W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $62,000,"
      2 = " 2 $62,000-$85,999,"
      3 = " 3 $86,000-$149,999,"
      4 = " 4 $150,000-$434,999, or"
      5 = " 5 $435,000 or more?"    ;

    VALUE W000141W

     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $1,000,"
      2 = " 2 $1,000-$1,999,"
      3 = " 3 $2,000-$19,999,"
      4 = " 4 $20,000-$49,999, or"
      5 = " 5 $50,000 or more?"    ;

    VALUE W000142W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $77,000,"
      2 = " 2 $77,000-$79,999,"
      3 = " 3 $80,000-$171,999,"
      4 = " 4 $172,000-$199,999, or"
      5 = " 5 $200,000 or more?"    ;

    VALUE W000143W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $1,000,"
      2 = " 2 $1,000-$15,999,"
      3 = " 3 $16,000-$33,999,"
      4 = " 4 $34,000-$55,999, or"
      5 = " 5 $56,000 or more?"    ;

    VALUE W000144W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $11,000,"
      2 = " 2 $11,000-$22,999,"
      3 = " 3 $23,000-$44,999,"
      4 = " 4 $45,000-$112,999, or"
      5 = " 5 $113,000 or more?"    ;

    VALUE W000145W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $1,000,"
      2 = " 2 $1,000-$5,999,"
      3 = " 3 $6,000-$13,999,"
      4 = " 4 $14,000-$35,999, or"
      5 = " 5 $36,000 or more?"    ;

    VALUE W000146W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $10,000,"
      2 = " 2 $10,000-$22,999,"
      3 = " 3 $23,000-$55,999,"
      4 = " 4 $56,000-$80,999, or"
      5 = " 5 $81,000 or more?"    ;

    VALUE W000147W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $600,"
      2 = " 2 $600-$999,"
      3 = " 3 $1,000-$2,999,"
      4 = " 4 $3,000-$10,999, or"
      5 = " 5 $11,000 or more?"    ;

    VALUE W000148W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $500,"
      2 = " 2 $500-$999,"
      3 = " 3 $1,000-$3,999,"
      4 = " 4 $4,000-$15,999, or"
      5 = " 5 $16,000 or more?"    ;

    VALUE W000149W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $200,"
      2 = " 2 $200-$999,"
      3 = " 3 $1,000-$3,999,"
      4 = " 4 $4,000-$6,999, or"
      5 = " 5 $7,000 or more?"    ;

    VALUE W000150W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $30,000,"
      2 = " 2 $30,000-$151,999,"
      3 = " 3 $152,000-$367,999,"
      4 = " 4 $368,000-$956,999, or"
      5 = " 5 $957,000 or more?"    ;

    VALUE W000151W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $30,000,"
      2 = " 2 $30,000-$88,999,"
      3 = " 3 $89,000-$295,999,"
      4 = " 4 $296,000-$360,999, or"
      5 = " 5 $361,000 or more?"    ;

    VALUE W000152W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $7,200,"
      2 = " 2 $7,200-$16,799,"
      3 = " 3 $16,800-$40,799,"
      4 = " 4 $40,800-$86,399, or"
      5 = " 5 $86,400 or more?"    ;

    VALUE W000153W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $6,000,"
      2 = " 2 $6,000-$11,999,"
      3 = " 3 $12,000-$23,999,"
      4 = " 4 $24,000-$47,999, or"
      5 = " 5 $48,000 or more?"    ;

    VALUE W000154W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $27,600,"
      2 = " 2 $27,600-$41,999,"
      3 = " 3 $42,000-$63,999,"
      4 = " 4 $64,000-$107,999, or"
      5 = " 5 $108,000 or more?"    ;

    VALUE W000155W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $14,000,"
      2 = " 2 $14,000-$21,999,"
      3 = " 3 $22,000-$35,999,"
      4 = " 4 $36,000-$48,999, or"
      5 = " 5 $49,000 or more?"    ;

    VALUE W000156W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $2,500,"
      2 = " 2 $2,500-$4,999,"
      3 = " 3 $5,000-$7,499,"
      4 = " 4 $7,500-$9,999,"
      5 = " 5 $10,000-$19,999, or"
      6 = " 6 $20,000 or more?"    ;

    VALUE W000157W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 PAY OFF BALANCE"
      2 = " 2 PAY MINIMUM"
      3 = " 3 PAY MORE THAN MINIMUM, BUT NOT ENTIRE BALANCE"
      4 = " 4 DON'T HAVE ANY CREDIT CARDS"    ;

    VALUE W000158W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $1,000,"
      2 = " 2 over $1,000 but less than $2,000,"
      3 = " 3 over $2,000 but less than $4,000,"
      4 = " 4 over $4,000 but less than $6,000,"
      5 = " 5 over $6,000 but less than $10,000,"
      6 = " 6 over $10,000 but less than $20,000, or"
      7 = " 7 $20,000 or more?"    ;

    VALUE W000159W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 MOST"
      2 = " 2 SOME"
      3 = " 3 A LITTLE"    ;

    VALUE W000160W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 less than $500,"
      2 = " 2 over $500 but less than $1,000,"
      3 = " 3 over $1,000 but less than $2,000,"
      4 = " 4 over $2,000 but less than $4,000,"
      5 = " 5 over $4,000 but less than $6,000,"
      6 = " 6 over $6,000 but less than $10,000,"
      7 = " 7 over $10,000 but less than $20,000, or"
      8 = " 8 $20,000 or more?"    ;

    VALUE W000161W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 CHILD/CHILDREN"
      2 = " 2 SOMEONE ELSE"    ;

    VALUE W000162W
      -7 = '-7 RF'
      -8 = '-8 DK'
      -1 = '-1 Inapplicable'
      -9 = '-9 Missing'
       1 = " 1 HelperChildRel: Person 1"
       2 = " 2 HelperChildRel: Person 2"
       3 = " 3 HelperChildRel: Person 3"
       4 = " 4 HelperChildRel: Person 4"
       5 = " 5 HelperChildRel: Person 5"
       6 = " 6 HelperChildRel: Person 6"
       7 = " 7 HelperChildRel: Person 7"
       8 = " 8 HelperChildRel: Person 8"
       9 = " 9 HelperChildRel: Person 9"
      10 = "10 HelperChildRel: Person 10"
      11 = "11 HelperChildRel: Person 11"
      12 = "12 HelperChildRel: Person 12"
      13 = "13 HelperChildRel: Person 13"
      14 = "14 HelperChildRel: Person 14"
      15 = "15 HelperChildRel: Person 15"
      16 = "16 HelperChildRel: Person 16"
      17 = "17 HelperChildRel: Person 17"
      18 = "18 HelperChildRel: Person 18"
      19 = "19 HelperChildRel: Person 19"
      20 = "20 HelperChildRel: Person 20"
      21 = "21 HelperChildRel: Person 21"
      22 = "22 HelperChildRel: Person 22"
      23 = "23 HelperChildRel: Person 23"
      24 = "24 HelperChildRel: Person 24"    ;

    VALUE W000163W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 CHILD/CHILDREN"
      2 = " 2 GRANDCHILD/GRANDCHILDREN"
      3 = " 3 SOMEONE ELSE"    ;

    VALUE W000164W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 NEARLY EVERY DAY"
      2 = " 2 MORE THAN HALF THE DAYS"
      3 = " 3 SEVERAL DAYS (LESS THAN HALF)"
      4 = " 4 A FEW DAYS"    ;

    VALUE W000165W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 INCLUDED"
      2 = " 2 EXTRA CHARGE"    ;

    VALUE W000166W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 YES, PHONE NUMBER PROVIDED"
      2 = " 2 NO PHONE NUMBER AVAILABLE"
      3 = " 3 REFUSED TO GIVE PHONE NUMBER"    ;

    VALUE W000167W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 HOME"
      2 = " 2 CELL PHONE"
      3 = " 3 WORK PHONE"
     91 = "91 SOMEWHERE ELSE (SPECIFY)"    ;

    VALUE W000168W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 Yes"    ;

    VALUE I000001W
      12 = "12 STARTED"
      20 = "20 COMPLETE"
      21 = "21 INELIGIBLE - NOT 65+"    ;

    VALUE I000002W
      12 = "12 Started"
      20 = "20 Complete"    ;

    VALUE I000003W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
     24 = "24 Notrequired"    ;

    VALUE I000004W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 YES"
      2 = " 2 NO"    ;

    VALUE I000005W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 IN PERSON"
      2 = " 2 TELEPHONE"    ;

    VALUE I000006W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 Friendly and interested"
      2 = " 2 Cooperative but not particularly interested"
      3 = " 3 Impatient and restless"
      4 = " 4 Hostile"    ;

    VALUE I000007W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 Good"
      2 = " 2 Fair"
      3 = " 3 Poor"    ;

    VALUE I000008W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 All of the time"
      2 = " 2 Most of the time"
      3 = " 3 Some of the time"
      4 = " 4 Only for the cognition and/or performance parts"
      5 = " 5 None of the time"    ;

    VALUE I000009W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 YES"
      2 = " 2 NO"
      3 = " 3 Interview was conducted by telephone"    ;

    VALUE I000010W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 Spouse/Partner"
      2 = " 2 Child of SP"
      3 = " 3 Other relative"
      4 = " 4 Friend/Neighbor"
      5 = " 5 Staff person from place SP lives"
      6 = " 6 Personal helper/aide"
     91 = "91 Other"    ;

    VALUE I000011W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 Yes"
      2 = " 2 No"
      3 = " 3 Not Administered"    ;

    VALUE I000012W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 SP/Proxy too tired to complete in 1 session"
      2 = " 2 SP/Proxy felt poorly/ill / SP's health"
      3 = " 3 Schedule conflict for respondent"
      91 =  "91 Other(Specify)"    ;

    VALUE I000013W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 Not at all cluttered"
      2 = " 2 Somewhat cluttered"
      3 = " 3 Very cluttered"
      4 = " 4 Could not see other rooms"    ;

    VALUE I000014W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 NONE"
      2 = " 2 A LITTLE"
      3 = " 3 SOME"
      4 = " 4 A LOT"    ;

    VALUE I000015W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 YES"
      2 = " 2 NO"
      7 = " 7 Could not observe"    ;

    VALUE I000016W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 IN PERSON"
      2 = " 2 BY PHONE"    ;

      VALUE F000001W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 MALE"
      2 = " 2 FEMALE"      ;

      VALUE F000002W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 Yes"      ;

      VALUE F000003W
     -7 = '-7 RF'
     -8 = '-8 DK'
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing'
      1 = " 1 CONSENT TO RECORDING"
      7 = " 7 REFUSE CONSENT TO RECORD"      ;

      VALUE F000004W
       -7 = '-7 RF'
       -8 = '-8 DK'
       -1 = '-1 Inapplicable'
       -9 = '-9 Missing'
        1 = " 1 FREE STANDING NURSING HOME"
        2 = " 2 FREE STANDING ASSISTED LIVING FACILITY"
        3 = " 3 NURSING HOME AND ASSISTED LIVING FACILITY"
        4 = " 4 CONTINUING CARE RETIREMENT COMMUNITY (CCRC)"
        5 = " 5 ADULT FAMILY CARE HOME"
        6 = " 6 GROUP HOME"
        7 = " 7 BOARD AND CARE HOME"
        8 = " 8 RETIREMENT COMMUNITY OR SENIOR HOUSING (NOT CCRC)"
       91 = "91 OTHER (SPECIFY)"      ;

      VALUE F000005W
       -7 = '-7 RF'
       -8 = '-8 DK'
       -1 = '-1 Inapplicable'
       -9 = '-9 Missing'
        1 = " 1 YES"
        2 = " 2 NO"      ;

      VALUE F000006W
       -7 = '-7 RF'
       -8 = '-8 DK'
       -1 = '-1 Inapplicable'
       -9 = '-9 Missing'
        1 = " 1 INDEPENDENT LIVING"
        2 = " 2 ASSISTED LIVING"
        3 = " 3 SPECIAL CARE, MEMORY CARE, OR ALZHEIMER'S UNIT"
        4 = " 4 NURSING HOME"
       91 = "91 OTHER (SPECIFY)"      ;

      VALUE F000007W
       -7 = '-7 RF'
       -8 = '-8 DK'
       -1 = '-1 Inapplicable'
       -9 = '-9 Missing'
        1 = " 1 ASSISTED LIVING"
        2 = " 2 NURSING HOME"      ;

      VALUE F000008W
       -7 = '-7 RF'
       -8 = '-8 DK'
       -1 = '-1 Inapplicable'
       -9 = '-9 Missing'
        1 = " 1 ASSISTED LIVING"
        2 = " 2 NURSING HOME"
        3 = " 3 BOTH"      ;

      VALUE F000009W
       -7 = '-7 RF'
       -8 = '-8 DK'
       -1 = '-1 Inapplicable'
       -9 = '-9 Missing'
        1 = " 1 YES, SERVICE PROVIDED AS PART OF PACKAGE"
        2 = " 2 YES, SERVICE PROVIDED AT AN EXTRA CHARGE"
        3 = " 3 NO, SERVICE NOT PROVIDED"
      ;

      VALUE F000010W

       -7 = '-7 RF'
       -8 = '-8 DK'
       -1 = '-1 Inapplicable'
       -9 = '-9 Missing'
        1 = " 1 SP/FAMILY"
        2 = " 2 SOCIAL SECURITY/SSI"
        3 = " 3 MEDICAID"
        4 = " 4 MEDICARE"
        5 = " 5 OTHER SOURCE"
      ;

      VALUE F000011W
       -7 = '-7 RF'
       -8 = '-8 DK'
       -1 = '-1 Inapplicable'
       -9 = '-9 Missing'
        1 = " 1 INDEPENDENT LIVING"
        2 = " 2 ASSISTED LIVING"
        3 = " 3 SPECIAL CARE UNIT ASSISTED LIVING"
        4 = " 4 NURSING HOME"
        5 = " 5 SPECIAL CARE UNIT NURSING HOME"
        6 = " 6 OTHER (SPECIFY)"      ;

      VALUE F000012W
        12 = "12 STARTED"
        20 = "20 COMPLETED"
        24 = "24 NOT REQUIRED"      ;

      VALUE F000013W
        61 = "61 COMPLETE, NH FACILITY"      ;

      VALUE F000014W
        1 = "1 NURSING HOME"
        2 = "2 OTHER FACILITY"      ;
********;
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
    1 = '1 Eligible and recorded result for Full tandem Balance'
    2 = '2 Eligible and no recorded result for Full tandem Balance'
    3 = '3 Not administered because did not complete prior balance tests'
    4 = '4 Not Eligible due to exclusion criteria'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

VALUE BA1OP
    1 = '1 Eligible and recorded result for One leg eyes open Balance'
    2 = '2 Eligible and no recorded result for One leg eyes open Balance'
    3 = '3 Not administered because did not complete prior balance tests'
    4 = '4 Not Eligible due to exclusion criteria'
    -1 = '-1 Inapplicable'
    -9 = '-9 Missing';

VALUE BA1CL
    1 = '1 Eligible and recorded result for One leg eyes closed Balance'
    2 = '2 Eligible and no recorded result for One leg eyes closed Balance'
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
    439= '439 Household chores (can not tell if indoor/outdoor)'
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
    998= '998 Don''t Know'
    999= '999 Not Codeable';

VALUE $PA25FM
    '-1' = '-1 Inapplicable'
    '-9' = '-9 Missing'
    '111'= '111 Sleeping Napping'
    '131'= '131 Eating'
    '132'= '132 Going out to eat'
    '199'= '199 Other self care activities'
    '211'= '211 Work and work-related activities'
    '221'= '221 Other income generating activities'
    '241'= '241 Volunteering'
    '299'= '299 Other productive activities'
    '321'= '321 Shopping for non-durable goods'
    '399'= '399 Other shopping'
    '411'= '411 Food and drink preparation'
    '434'= '434 Outdoor Maintenance'
    '439'= '439 Household chores (can not tell if indoor/outdoor)'
    '441'= '441 Animal and pet care'
    '442'= '442 Walking and exercising pets'
    '449'= '449 Other animal and pet care'
    '451'= '451 Vehicle maintenance and repair'
    '471'= '471 Financial management'
    '499'= '499 Other household activities'
    '511'= '511 Physical care and assistance to others'
    '599'= '599 Other physical care'
    '611'= '611 Socializing with others in person'
    '612'= '612 Socializing with others on the phone'
    '616'= '616 Socializing and communicating on the computer'
    '621'= '621 Watching TV and movies'
    '631'= '631 Doing puzzles or games not on computer or online'
    '632'= '632 Gambling not online or at a casino'
    '636'= '636 Doing puzzles or games on a computer or online'
    '641'= '641 Arts and crafts or hobbies'
    '642'= '642 Reading'
    '643'= '643 Writing'
    '644'= '644 Listening to music'
    '646'= '646 Computer or online leisure activities'
    '651'= '651 Smoking or other tobacco use'
    '652'= '652 Drinking alcohol'
    '661'= '661 Doing nothing/relaxing'
    '669'= '669 No activity'
    '699'= '699 Other non active leisure'
    '711'= '711 Playing sports'
    '712'= '712 Walking or jogging'
    '713'= '713 Other outdoor recreating activities'
    '714'= '714 Attending sporting events'
    '718'= '718 Watching sporting events'
    '721'= '721 Attending arts  including plays and concerts'
    '723'= '723 Attending movies'
    '724'= '724 Attending casinos'
    '737'= '737 Travel for leisure'
    '799'= '799 Other active leisure'
    '811'= '811 Attending religious activities'
    '812'= '812 Other religious and spirtual activities'
    '821'= '821 Attending meetings or events'
    '899'= '899 Other organizational activity'
    '991'= '991 Other miscellaneous'
    '992'= '992 No favorite activity'
    '997'= '997 Refused'
    '998'= '998 Don''t Know'
    '999'= '999 Not Codeable';

/* ADD NEW FORMATS FOR THE PE DATA. */

VALUE PE_COMP
    1 = '1 Completed    '
    2 = '2 Attempted    '
    3 = '3 Not attempted'
   -1 = '-1 Inapplicable'
   -9 = '-9 Missing';


VALUE PE_YES
  1-HIGH = '1 Yes'
 -1 = '-1 Inapplicable'
 -9 = '-9 Missing';

 VALUE WalkAid
  1 = '1 none'
  2 = '2 cane'
  3 = '3 walker or rollator'
  9 = '4 other'
 -1 = '-1 Inapplicable'
 -7 = '-7 RF'
 -8 = '-8 DK'
 -9 = '-9 Missing';

 VALUE CH_ARMS
  1 = '1 with arms'
  2 = '2 without arms'
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

 VALUE A0001AB
      1 = "1 AM"
      2 = "2 PM"
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing';

 VALUE A0003BA
      1 = "1 Completed, held for 10 seconds"
      2 = "2 Attempted, not held for 10 seconds"
      3 = "3 Not attempted"
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing';

VALUE A0019BA
      1 = "1 Completed, held for 30 seconds"
      2 = "2 Attempted, not held for 30 seconds"
      3 = "3 Not attempted"
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

      VALUE OCCCODE
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
24  ='24 NSOC: No current occ (Unemployed, no work in the last 5 years, never worked):  9920'
25 = '25 Blank field'
26 = '26 Code did not match'
94 = '94 Uncodable'
95 = '95 Never Worked Entire Life'
96 = '96 Homemaker/Raised Children'
-7 = '-7 RF'
-8 = '-8 DK'
-1 = '-1 Inapplicable'
-9 = '-9 Missing';

VALUE R1DSPPBM
-1="-1: Inapplicable"
1="1: PROXY INTERVIEW"
2="2: MISSING WALK AND REPEAT CHAIR AND BALANCE"
3="3: MISSING WALK AND REPEAT CHAIR"
4="4: MISSING WALK AND BALANCE"
5="5: MISSING REPEAT CHAIR AND BALANCE"
6="6: MISSING WALK"
7="7: MISSING REPEAT CHAIR"
8="8: MISSING BALANCE"
9="9: NO SPACE"
10="10: NO CHAIR"
11="11: NO SPACE WALK AND NO CHAIR"
12="12: NO SPACE WALK AND NON-SAFETY MISSING"
13="13: NO CHAIR AND NON-SAFETY MISSING"
14="14: NON-SAFETY WALK"
15="15: NON-SAFETY CHAIR"
16="16: NON-SAFETY BALANCE"
17="17: NON-SAFETY WALK AND CHAIR"
18="18: NON-SAFETY WALK AND BALANCE"
19="19: NON-SAFETY CHAIR AND BALANCE"
20="20: NON-SAFETY WALK AND CHAIR AND BALANCE"
;

VALUE dchntinhh
    1 = ' 1 Child identified in interview but not enumerated to OP File'
   -1 = '-1 Inapplicable';

 VALUE STAT1A
      0 = "0 No"
      1 = "1 Yes"
     -1 = '-1 Inapplicable'
     -9 = '-9 Missing';

 VALUE $SPOUSEID
         '-1' = "-1 Inapplicable"
         '-9' = "-9 Missing";
RUN;
/* Section #2 - Input statement with variable name and location on the .txt file  
		Reminder - change [PATH] to reflect your file locations       */

Data spfile;
INFILE  "[PATH]\NHATS_Round_1_SP_File_V3.txt"

LRECL=3894 ;
INPUT @1 spid 8.
@9 r1dresid 2.
@11 r1dresidr 2.
@13 r1breakoffst 2.
@15 r1breakoffqt $25.
@40 is1resptype 2.
@42 is1reasnprx1 2.
@44 is1reasnprx2 2.
@46 is1reasnprx3 2.
@48 is1reasnprx4 2.
@50 is1reasnprx5 2.
@52 is1reasnprx6 2.
@54 is1reasnprx9 2.
@56 r1dgender 2.
@58 r1d2intvrage 3.
@61 is1prxyrelat 2.
@63 is1prxygendr 2.
@65 is1famrrutin 2.
@67 is1dproxyid $3.
@70 re1resistrct 2.
@72 re1bldgfl 2.
@74 re1dcensdiv 2.
@76 fl1structure 2.
@78 fl1bldgfl 2.
@80 hc1health 2.
@82 hc1disescn1 2.
@84 hc1disescn2 2.
@86 hc1disescn3 2.
@88 hc1disescn4 2.
@90 hc1disescn5 2.
@92 hc1disescn6 2.
@94 hc1disescn7 2.
@96 hc1disescn8 2.
@98 hc1disescn9 2.
@100 hc1disescn10 2.
@102 hc1cancerty1 2.
@104 hc1dementage 3.
@107 hc1brokebon1 2.
@109 hc1brokebon2 2.
@111 hc1serdisill 2.
@113 hc1hosptstay 2.
@115 hc1hosovrnht 2.
@117 hc1kneesurg 2.
@119 hc1knesrgyr 2.
@121 hc1ageknesur 3.
@124 hc1hipsurg 2.
@126 hc1hipsrgyr 2.
@128 hc1agehipsur 3.
@131 hc1catarsurg 2.
@133 hc1catrsrgyr 2.
@135 hc1agecatsur 3.
@138 hc1bckspnsur 2.
@140 hc1backsrgyr 2.
@142 hc1agebcksrg 3.
@145 hc1heartsurg 2.
@147 hc1hartsrgyr 2.
@149 hc1agehrtsrg 3.
@152 hc1fllsinmth 2.
@154 hc1worryfall 2.
@156 hc1worrylimt 2.
@158 hc1faleninyr 2.
@160 hc1multifall 2.
@162 hc1depresan1 2.
@164 hc1depresan2 2.
@166 hc1depresan3 2.
@168 hc1depresan4 2.
@170 hc1aslep30mn 2.
@172 hc1trbfalbck 2.
@174 hc1sleepmed 2.
@176 ht1longlived 2.
@178 ht1mthslived 2.
@180 ht1yrslived 2.
@182 ht1longer5yr 2.
@184 ht1placedesc 2.
@186 ht1retiresen 2.
@188 ht1diffareun 2.
@190 ht1helpmedbd 2.
@192 ht1meals 2.
@194 ht1spacename 2.
@196 fl1facility 2.
@198 fl1hotype 2.
@200 fl1retirecom 2.
@202 se1servcoff1 2.
@204 se1servcoff2 2.
@206 se1servcoff3 2.
@208 se1servcoff4 2.
@210 se1servcoff5 2.
@212 se1servcoff6 2.
@214 se1servcoff7 2.
@216 se1servcoff8 2.
@218 se1servcoff9 2.
@220 se1servused1 2.
@222 se1servused2 2.
@224 se1servused3 2.
@226 se1servused4 2.
@228 se1servused5 2.
@230 se1servused6 2.
@232 se1servused7 2.
@234 se1servused8 2.
@236 se1servused9 2.
@238 se1payservi1 2.
@240 se1payservi2 2.
@242 se1payservi3 2.
@244 se1payservi4 2.
@246 se1payservi5 2.
@248 se1payservi6 2.
@250 se1payservi7 2.
@252 se1payservi8 2.
@254 se1payservi9 2.
@256 hh1martlstat 2.
@258 hh1yrendmarr 4.
@262 hh1yrsmarliv 2.
@264 hh1spgender 2.
@266 hh1d2spouage 3.
@269 hh1spouseduc 2.
@271 hh1spoupchlp 2.
@273 hh1livwthspo 2.
@275 hh1placekind 2.
@277 hh1proxlivsp 2.
@279 hh1othlvhere 2.
@281 hh1dspouseid $3.
@284 hh1dlvngarrg 2.
@286 hh1dhshldnum 2.
@288 hh1dhshldchd 2.
@290 cs1dreconcil 2.
@292 cs1sistrsnum 2.
@294 cs1brthrsnum 2.
@296 cs1dnumchild 2.
@298 cs1dnmstpchd 2.
@300 cs1dnumdaugh 2.
@302 cs1dnumson 2.
@304 sn1dnumsn 2.
@306 fl1noonetalk 2.
@308 ho1entrstair 2.
@310 ho1entrccomn 2.
@312 ho1entrnramp 2.
@314 ho1bldgamen1 2.
@316 ho1bldgamen2 2.
@318 ho1bldgamen3 2.
@320 ho1bldgamen4 2.
@322 ho1levelsflr 2.
@324 ho1homeamen1 2.
@326 ho1homeamen2 2.
@328 ho1homeamen3 2.
@330 ho1bathprivt 2.
@332 ho1bathamen1 2.
@334 ho1bathamen2 2.
@336 ho1bathamen3 2.
@338 ho1bathamen4 2.
@340 ho1bathamen5 2.
@342 ho1bathamen6 2.
@344 ho1bathamen7 2.
@346 ho1kitchnprv 2.
@348 ho1kitchncom 2.
@350 ho1microwave 2.
@352 fl1onefloor 2.
@354 fl1bathgrbbr 2.
@356 fl1bathseat 2.
@358 fl1raisedtlt 2.
@360 fl1tltgrbbr 2.
@362 em1modhere1 2.
@364 em1addlstyr1 2.
@366 em1addlstyr2 2.
@368 em1addlstyr3 2.
@370 em1addlstyr4 2.
@372 em1addlstyr5 2.
@374 em1addlstyr6 2.
@376 em1addlstyr7 2.
@378 em1payyufam1 2.
@380 em1payyufam2 2.
@382 em1payyufam3 2.
@384 em1payyufam4 2.
@386 em1payyufam5 2.
@388 em1payyufam6 2.
@390 em1payyufam7 2.
@392 em1paydevce1 2.
@394 em1paydevce2 2.
@396 em1paydevce3 2.
@398 em1paydevce4 2.
@400 em1paydevce5 2.
@402 em1paydevce6 2.
@404 em1paydevce7 2.
@406 em1paydevce8 2.
@408 em1paydevce9 2.
@410 em1payaltgth 2.
@412 em1morls1000 2.
@414 em1morls100 2.
@416 cm1knowwell 2.
@418 cm1willnghlp 2.
@420 cm1peoptrstd 2.
@422 te1cellphone 2.
@424 te1othrphone 2.
@426 te1computer 2.
@428 te1compoth 2.
@430 te1emailtext 2.
@432 te1oftnemail 2.
@434 te1online 2.
@436 te1shoponli1 2.
@438 te1shoponli2 2.
@440 te1shoponli3 2.
@442 te1intrntmd1 2.
@444 te1intrntmd2 2.
@446 te1intrntmd3 2.
@448 md1canewlker 2.
@450 md1cane 2.
@452 md1walker 2.
@454 md1wheelchar 2.
@456 md1whelcrspc 2.
@458 md1scooter 2.
@460 md1scterinsp 2.
@462 fl1cane 2.
@464 fl1walker 2.
@466 fl1wheelchr 2.
@468 fl1whlchrhom 2.
@470 fl1scooter 2.
@472 fl1scooterhm 2.
@474 ss1heringaid 3.
@477 ss1hearphone 2.
@479 ss1convwradi 2.
@481 ss1convquiet 2.
@483 ss1glasseswr 3.
@486 ss1seewellst 2.
@488 ss1seestvgls 2.
@490 ss1glasscls 2.
@492 ss1othvisaid 2.
@494 ss1glrednewp 2.
@496 ss1probchswl 2.
@498 ss1probspeak 2.
@500 ss1painbothr 2.
@502 ss1painlimts 2.
@504 ss1painmedof 2.
@506 ss1painwhe1 2.
@508 ss1painwhe2 2.
@510 ss1painwhe3 2.
@512 ss1painwhe4 2.
@514 ss1painwhe5 2.
@516 ss1painwhe6 2.
@518 ss1painwhe7 2.
@520 ss1painwhe8 2.
@522 ss1painwhe9 2.
@524 ss1painwhe10 2.
@526 ss1painwhe11 2.
@528 ss1painwhe12 2.
@530 ss1painwhe13 2.
@532 ss1probbreat 2.
@534 ss1prbbrlimt 2.
@536 ss1strnglmup 2.
@538 ss1uplimtact 2.
@540 ss1lwrbodstr 2.
@542 ss1lwrbodimp 2.
@544 ss1lowenergy 2.
@546 ss1loenlmtat 2.
@548 ss1prbbalcrd 2.
@550 ss1prbbalcnt 2.
@552 pc1walk6blks 2.
@554 pc1walk3blks 2.
@556 pc1up20stair 2.
@558 pc1up10stair 2.
@560 pc1car20pnds 2.
@562 pc1car10pnds 2.
@564 pc1geonknees 2.
@566 pc1bendover 2.
@568 pc1hvobovrhd 2.
@570 pc1rechovrhd 2.
@572 pc1opnjarwhd 2.
@574 pc1grspsmobj 2.
@576 cp1memrygood 2.
@578 cp1knownspyr 2.
@580 cp1chgthink1 2.
@582 cp1chgthink2 2.
@584 cp1chgthink3 2.
@586 cp1chgthink4 2.
@588 cp1chgthink5 2.
@590 cp1chgthink6 2.
@592 cp1chgthink7 2.
@594 cp1chgthink8 2.
@596 cp1memcogpr1 2.
@598 cp1memcogpr2 2.
@600 cp1memcogpr3 2.
@602 cp1memcogpr4 2.
@604 cg1speaktosp 2.
@606 cg1quesremem 2.
@608 cg1reascano1 2.
@610 cg1reascano2 2.
@612 cg1reascano3 2.
@614 cg1reascano4 2.
@616 cg1reascano5 2.
@618 cg1reascano6 2.
@620 cg1reascano7 2.
@622 cg1reascano8 2.
@624 cg1reascano9 2.
@626 cg1ratememry 2.
@628 cg1ofmemprob 2.
@630 cg1memcom1yr 2.
@632 cg1todaydat1 2.
@634 cg1todaydat2 2.
@636 cg1todaydat3 2.
@638 cg1todaydat4 2.
@640 cg1todaydat5 2.
@642 cg1prewrdrcl 2.
@644 cg1dwrdlstnm 2.
@646 cg1wrdsrcal1 2.
@648 cg1wrdsrcal2 2.
@650 cg1wrdsrcal3 2.
@652 cg1wrdsrcal4 2.
@654 cg1wrdsrcal5 2.
@656 cg1wrdsrcal6 2.
@658 cg1wrdsrcal7 2.
@660 cg1wrdsrcal8 2.
@662 cg1wrdsrcal9 2.
@664 cg1wrdsrca10 2.
@666 cg1dwrdimmrc 2.
@668 cg1dwrdinone 2.
@670 cg1dwrdirref 2.
@672 cg1wrdsntlst 2.
@674 cg1numnotlst 2.
@676 cg1probreca1 2.
@678 cg1probreca2 2.
@680 cg1probreca3 2.
@682 cg1probreca4 2.
@684 cg1dclkdraw 2.
@686 cg1dclkimgcl 2.
@688 cg1atdrwclck 2.
@690 cg1presidna1 2.
@692 cg1presidna2 2.
@694 cg1presidna3 2.
@696 cg1presidna4 2.
@698 cg1vpname1 2.
@700 cg1vpname2 2.
@702 cg1vpname3 2.
@704 cg1vpname4 2.
@706 cg1wrdsdcal1 2.
@708 cg1wrdsdcal2 2.
@710 cg1wrdsdcal3 2.
@712 cg1wrdsdcal4 2.
@714 cg1wrdsdcal5 2.
@716 cg1wrdsdcal6 2.
@718 cg1wrdsdcal7 2.
@720 cg1wrdsdcal8 2.
@722 cg1wrdsdcal9 2.
@724 cg1wrdsdca10 2.
@726 cg1dwrddlyrc 2.
@728 cg1dwrddnone 2.
@730 cg1dwrddrref 2.
@732 cg1wrdnotlst 2.
@734 cg1numwrdnot 2.
@736 cg1dwrd1rcl 2.
@738 cg1dwrd2rcl 2.
@740 cg1dwrd3rcl 2.
@742 cg1dwrd4rcl 2.
@744 cg1dwrd5rcl 2.
@746 cg1dwrd6rcl 2.
@748 cg1dwrd7rcl 2.
@750 cg1dwrd8rcl 2.
@752 cg1dwrd9rcl 2.
@754 cg1dwrd10rcl 2.
@756 cg1dwrd1dly 2.
@758 cg1dwrd2dly 2.
@760 cg1dwrd3dly 2.
@762 cg1dwrd4dly 2.
@764 cg1dwrd5dly 2.
@766 cg1dwrd6dly 2.
@768 cg1dwrd7dly 2.
@770 cg1dwrd8dly 2.
@772 cg1dwrd9dly 2.
@774 cg1dwrd10dly 2.
@776 mo1outoft 2.
@778 mo1outcane 2.
@780 mo1outwalkr 2.
@782 mo1outwlchr 2.
@784 mo1outsctr 2.
@786 mo1outhlp 2.
@788 mo1outslf 2.
@790 mo1outdif 2.
@792 mo1outyrgo 2.
@794 mo1outwout 2.
@796 mo1oftgoarea 2.
@798 mo1oflvslepr 2.
@800 mo1insdcane 2.
@802 mo1insdwalkr 2.
@804 mo1insdwlchr 2.
@806 mo1insdsctr 2.
@808 mo1oftholdwl 2.
@810 mo1insdhlp 2.
@812 mo1insdslf 2.
@814 mo1insddif 2.
@816 mo1insdyrgo 2.
@818 mo1insdwout 2.
@820 mo1beddev 2.
@822 mo1bedhlp 2.
@824 mo1bedslf 2.
@826 mo1beddif 2.
@828 mo1bedwout 2.
@830 mo1doutsfdf 2.
@832 mo1doutdevi 2.
@834 mo1douthelp 2.
@836 mo1dinsdsfdf 2.
@838 mo1dinsddevi 2.
@840 mo1dinsdhelp 2.
@842 mo1dbedsfdf 2.
@844 mo1dbeddevi 2.
@846 mo1dbedhelp 2.
@848 fl1didntleav 2.
@850 fl1ntlvrmslp 2.
@852 dm1helpmobil 2.
@854 dm1helpyrmor 2.
@856 dm1yrsgethlp 3.
@859 dm1mthgethlp 2.
@861 dm1lstyrcane 2.
@863 dm1caneforyr 2.
@865 dm1yrsuscane 3.
@868 dm1mtfrtcane 2.
@870 dm1mobhelp65 2.
@872 dm1snc65mohl 2.
@874 dm1at65uscan 2.
@876 dm1snc65uscn 2.
@878 dm1dhlpyr 2.
@880 dm1dhlpst 2.
@882 dm1dhlpend 2.
@884 dm1dhlpyrs 3.
@887 dm1ddeviyr 2.
@889 dm1ddevist 2.
@891 dm1ddeviend 2.
@893 dm1ddeviyrs 3.
@896 dt1oftedrive 2.
@898 dt1lastdrove 2.
@900 dt1mthltdrov 2.
@902 dt1yrlstdrov 4.
@906 dt1mthagodrv 2.
@908 dt1yragoldrv 2.
@910 dt1ageltdrov 3.
@913 dt1avoidriv1 2.
@915 dt1avoidriv2 2.
@917 dt1avoidriv3 2.
@919 dt1avoidriv4 2.
@921 dt1getoplcs1 2.
@923 dt1getoplcs2 2.
@925 dt1getoplcs3 2.
@927 dt1getoplcs4 2.
@929 dt1getoplcs5 2.
@931 dt1getoplcs6 2.
@933 dt1getoplcs7 2.
@935 dt1otfrfamtk 2.
@937 fl1drives 2.
@939 fl1drvlstyr 2.
@941 ha1laun 2.
@943 ha1launslf 2.
@945 ha1whrmachi1 2.
@947 ha1whrmachi2 2.
@949 ha1whrmachi3 2.
@951 ha1whrmachi4 2.
@953 ha1whrmachi5 2.
@955 ha1whrmachi6 2.
@957 ha1dlaunreas 2.
@959 ha1laundif 2.
@961 ha1launoft 2.
@963 ha1launwout 2.
@965 ha1shop 2.
@967 ha1shopslf 2.
@969 ha1howpaygr1 2.
@971 ha1howpaygr2 2.
@973 ha1howpaygr3 2.
@975 ha1howpaygr4 2.
@977 ha1howpaygr5 2.
@979 ha1howpaygr6 2.
@981 ha1howpaygr7 2.
@983 ha1howgtstr1 2.
@985 ha1howgtstr2 2.
@987 ha1howgtstr3 2.
@989 ha1howgtstr4 2.
@991 ha1howgtstr5 2.
@993 ha1howgtstr6 2.
@995 ha1howgtstr7 2.
@997 ha1howgtstr8 2.
@999 ha1shopcart 2.
@1001 ha1shoplean 2.
@1003 ha1dshopreas 2.
@1005 ha1shopdif 2.
@1007 ha1shopoft 2.
@1009 ha1shopwout 2.
@1011 ha1meal 2.
@1013 ha1mealslf 2.
@1015 ha1restamels 2.
@1017 ha1oftmicrow 2.
@1019 ha1dmealreas 2.
@1021 ha1mealdif 2.
@1023 ha1mealoft 2.
@1025 ha1mealwout 2.
@1027 ha1bank 2.
@1029 ha1bankslf 2.
@1031 ha1dbankreas 2.
@1033 ha1bankdif 2.
@1035 ha1bankoft 2.
@1037 ha1bankwout 2.
@1039 ha1money 2.
@1041 ha1moneyhlp 2.
@1043 ha1dlaunsfdf 2.
@1045 ha1dshopsfdf 2.
@1047 ha1dmealsfdf 2.
@1049 ha1dbanksfdf 2.
@1051 ha1dmealwhl 2.
@1053 ha1dmealtkot 2.
@1055 sc1eatdev 2.
@1057 sc1eatdevoft 2.
@1059 sc1eathlp 2.
@1061 sc1eatslfoft 2.
@1063 sc1eatslfdif 2.
@1065 sc1eatwout 2.
@1067 sc1showrbat1 2.
@1069 sc1showrbat2 2.
@1071 sc1showrbat3 2.
@1073 sc1prfrshbth 2.
@1075 sc1scusgrbrs 2.
@1077 sc1shtubseat 2.
@1079 sc1bathhlp 2.
@1081 sc1bathoft 2.
@1083 sc1bathdif 2.
@1085 sc1bathyrgo 2.
@1087 sc1bathwout 2.
@1089 sc1usvartoi1 2.
@1091 sc1usvartoi2 2.
@1093 sc1usvartoi3 2.
@1095 sc1usvartoi4 2.
@1097 sc1toilhlp 2.
@1099 sc1toiloft 2.
@1101 sc1toildif 2.
@1103 sc1toilwout 2.
@1105 sc1dresoft 2.
@1107 sc1dresdev 2.
@1109 sc1dreshlp 2.
@1111 sc1dresslf 2.
@1113 sc1dresdif 2.
@1115 sc1dresyrgo 2.
@1117 sc1dreswout 2.
@1119 sc1deatdevi 2.
@1121 sc1deathelp 2.
@1123 sc1deatsfdf 2.
@1125 sc1dbathdevi 2.
@1127 sc1dbathhelp 2.
@1129 sc1dbathsfdf 2.
@1131 sc1dtoildevi 2.
@1133 sc1dtoilhelp 2.
@1135 sc1dtoilsfdf 2.
@1137 sc1ddresdevi 2.
@1139 sc1ddreshelp 2.
@1141 sc1ddressfdf 2.
@1143 fl1showering 2.
@1145 fl1takingbth 2.
@1147 fl1washingup 2.
@1149 ds1gethlpeat 2.
@1151 ds1hlpmrtnyr 2.
@1153 ds1yrsgethlp 3.
@1156 ds1mthgethlp 2.
@1158 ds1gthptrn65 2.
@1160 ds1gthpsin65 2.
@1162 ds1dhlpyr 2.
@1164 ds1dhlpst 2.
@1166 ds1dhlpend 2.
@1168 ds1dhlpyrs 3.
@1171 mc1meds 2.
@1173 mc1medstrk 2.
@1175 mc1medsslf 2.
@1177 mc1whrgtmed1 2.
@1179 mc1whrgtmed2 2.
@1181 mc1whrgtmed3 2.
@1183 mc1whrgtmed4 2.
@1185 mc1howpkupm1 2.
@1187 mc1howpkupm2 2.
@1189 mc1howpkupm3 2.
@1191 mc1medsrem 2.
@1193 mc1dmedsreas 2.
@1195 mc1medsdif 2.
@1197 mc1medsyrgo 2.
@1199 mc1medsmis 2.
@1201 mc1havregdoc 2.
@1203 mc1regdoclyr 2.
@1205 mc1hwgtregd1 2.
@1207 mc1hwgtregd2 2.
@1209 mc1hwgtregd3 2.
@1211 mc1hwgtregd4 2.
@1213 mc1hwgtregd5 2.
@1215 mc1hwgtregd6 2.
@1217 mc1hwgtregd7 2.
@1219 mc1hwgtregd8 2.
@1221 mc1hwgtregd9 2.
@1223 mc1ansitindr 2.
@1225 mc1tpersevr1 2.
@1227 mc1tpersevr2 2.
@1229 mc1tpersevr3 2.
@1231 mc1tpersevr4 2.
@1233 mc1chginspln 2.
@1235 mc1anhlpwdec 2.
@1237 mc1dmedssfdf 2.
@1239 pa1vistfrfam 2.
@1241 pa1hlkepfvst 2.
@1243 pa1trkpfrvis 2.
@1245 pa1impvstfam 2.
@1247 pa1attrelser 2.
@1249 pa1htkfrrlsr 2.
@1251 pa1trprrelsr 2.
@1253 pa1imprelser 2.
@1255 pa1clbmtgrac 2.
@1257 pa1hlkpfrclb 2.
@1259 pa1trprkpfgr 2.
@1261 pa1imparclub 2.
@1263 pa1outfrenjy 2.
@1265 pa1hlkpgoenj 2.
@1267 pa1trprgoout 2.
@1269 pa1impouteny 2.
@1271 pa1workfrpay 2.
@1273 pa1hlkpfrwrk 2.
@1275 pa1voltrwork 2.
@1277 pa1hlkpfrvol 2.
@1279 pa1prcranoth 2.
@1281 pa1evrgowalk 2.
@1283 pa1vigoractv 2.
@1285 pa1helmfvact 2.
@1287 pa1dfavact $3.
@1290 sd1smokedreg 2.
@1292 sd1smokesnow 2.
@1294 sd1numcigday 3.
@1297 sd1agesrtsmk 2.
@1299 sd1agelstsmk 2.
@1301 pe1whhndsign 2.
@1303 pe1surghdwrt 2.
@1305 pe1surgyside 2.
@1307 pe1flruppain 2.
@1309 pe1sideflrup 2.
@1311 pe1surgarmsh 2.
@1313 pe1sidsurgar 2.
@1315 pe1surgyhips 2.
@1317 pe1sidhipsrg 2.
@1319 pe1stndwhold 2.
@1321 pe1upchbyslf 2.
@1323 pe1wlkdsself 2.
@1325 fl1lefthand 2.
@1327 fl1righthand 2.
@1329 fl1eiherhand 2.
@1331 fl1lftgrptst 2.
@1333 fl1rhtgrptst 2.
@1335 fl1charstnds 2.
@1337 fl1balstands 2.
@1339 fl1wlkingrse 2.
@1341 ba1dblssadm 2.
@1343 ba1dblstadm 2.
@1345 ba1dblftadm 2.
@1347 ba1dblopadm 2.
@1349 ba1dblcladm 2.
@1351 wa1dwlkadm 2.
@1353 ch1dschradm 2.
@1355 ch1drchradm 2.
@1357 gr1dgripadm 2.
@1359 wc1dwaistadm 2.
@1361 pk1dpeakadm 2.
@1363 ab1datemonth 2.
@1365 ab1dateyear 4.
@1369 in1strtabhrs 2.
@1371 in1strtabmin 2.
@1373 in1strtmampm 2.
@1375 ba1sxsresult 2.
@1377 ba1blstdsecs 4.
@1381 ba1blstdhndr 2.
@1383 ba1rsn1ssstd 2.
@1385 ba1rsn2ssstd 2.
@1387 ba1rsn3ssstd 2.
@1389 ba1rsn4ssstd 2.
@1391 ba1rsn9ssstd 2.
@1393 ba1stdmreslt 2.
@1395 ba1stdmsecs 4.
@1399 ba1stdmhndr 2.
@1401 ba1rsn1ststd 2.
@1403 ba1rsn2ststd 2.
@1405 ba1rsn3ststd 2.
@1407 ba1rsn4ststd 2.
@1409 ba1rsn9ststd 2.
@1411 ba1ftdmreslt 2.
@1413 ba1ftdmsecs 4.
@1417 ba1ftdmhndr 2.
@1419 ba1rsn1ftstd 2.
@1421 ba1rsn2ftstd 2.
@1423 ba1rsn3ftstd 2.
@1425 ba1rsn4ftstd 2.
@1427 ba1rsn9ftstd 2.
@1429 ba11leoreslt 2.
@1431 ba11leosfsec 4.
@1435 ba11leohndr 2.
@1437 ba1rsn11leo 2.
@1439 ba1rsn21leo 2.
@1441 ba1rsn31leo 2.
@1443 ba1rsn41leo 2.
@1445 ba1rsn91leo 2.
@1447 ba11lecreslt 2.
@1449 ba11lecsfsec 4.
@1453 ba11lechndr 2.
@1455 ba1rsn11lec 2.
@1457 ba1rsn21lec 2.
@1459 ba1rsn31lec 2.
@1461 ba1rsn41lec 2.
@1463 ba1rsn91lec 2.
@1465 wa1wlkcorspc 2.
@1467 wa1wkaidused 2.
@1469 wa1wlkc1rslt 2.
@1471 wa1wlkc1secs 4.
@1475 wa1wlk1hndr 2.
@1477 wa1rsn11wkc 2.
@1479 wa1rsn21wkc 2.
@1481 wa1rsn31wkc 2.
@1483 wa1rsn41wkc 2.
@1485 wa1rsn51wkc 2.
@1487 wa1rsn91wkc 2.
@1489 wa1wkaidusc2 2.
@1491 wa1wlkc2rslt 2.
@1493 wa1wlkc2secs 4.
@1497 wa1wlk2hndr 2.
@1499 wa1rsn12wkc 2.
@1501 wa1rsn22wkc 2.
@1503 wa1rsn32wkc 2.
@1505 wa1rsn42wkc 2.
@1507 wa1rsn92wkc 2.
@1509 ch1chravail 2.
@1511 ch1chstcompl 2.
@1513 ch1chairheit 2.
@1515 ch1whlchrusd 2.
@1517 ch1sgchstres 2.
@1519 ch1armuse 2.
@1521 ch1rsn11chs 2.
@1523 ch1rsn21chs 2.
@1525 ch1rsn31chs 2.
@1527 ch1rsn41chs 2.
@1529 ch1rsn51chs 2.
@1531 ch1rsn91chs 2.
@1533 ch12chstrslt 2.
@1535 ch1chstndsec 4.
@1539 ch1chstdhndr 2.
@1541 ch1chstddone 2.
@1543 ch1chstntdn1 2.
@1545 ch1chstntdn2 2.
@1547 ch1chstntdn3 2.
@1549 ch1chstntdn4 2.
@1551 ch1chstntdn5 2.
@1553 ch1chstntdn9 2.
@1555 ch1chstntat1 2.
@1557 ch1chstntat2 2.
@1559 ch1chstntat3 2.
@1561 ch1chstntat4 2.
@1563 ch1chstntat9 2.
@1565 gr1handtstd1 2.
@1567 gr1adjgr1ps3 2.
@1569 gr1grp1reslt 2.
@1571 gr1grp1rdng 6.3
@1577 gr1grp1noat1 2.
@1579 gr1grp1noat2 2.
@1581 gr1grp1noat3 2.
@1583 gr1grp1noat4 2.
@1585 gr1grp1noat9 2.
@1587 gr1handtstd2 2.
@1589 gr1adjgr2ps3 2.
@1591 gr1grp2reslt 2.
@1593 gr1grp2rdng 6.3
@1599 gr1grp2noat1 2.
@1601 gr1grp2noat2 2.
@1603 gr1grp2noat3 2.
@1605 gr1grp2noat4 2.
@1607 gr1grp2noat9 2.
@1609 wc1measdiff1 2.
@1611 wc1measdiff2 2.
@1613 wc1measdiff3 2.
@1615 wc1measdiff4 2.
@1617 wc1measdiff5 2.
@1619 wc1measdiff6 2.
@1621 wc1measdiff9 2.
@1623 wc1waistrslt 2.
@1625 wc1wstmsrinc 3.
@1628 wc1wstmsrqrt 2.
@1630 wc1wstbulkcl 2.
@1632 wc1whomeasur 2.
@1634 wc1wstpostn 2.
@1636 wc1wstnotat1 2.
@1638 wc1wstnotat2 2.
@1640 wc1wstnotat3 2.
@1642 wc1wstnotat4 2.
@1644 wc1wstnotat5 2.
@1646 wc1wstnotat9 2.
@1648 pk1pkarf1pos 2.
@1650 pk1pkarfl1ef 2.
@1652 pk1pkarfl1rs 2.
@1654 pk1pkarfl1rd 6.
@1660 pk1pk1noatt1 2.
@1662 pk1pk1noatt2 2.
@1664 pk1pk1noatt3 2.
@1666 pk1pk1noatt4 2.
@1668 pk1pk1noatt9 2.
@1670 pk1paf2posit 2.
@1672 pk1pkafl3eff 2.
@1674 pk1pkarfl2rs 2.
@1676 pk1pkarfl2rd 6.
@1682 pk1pk2noatt1 2.
@1684 pk1pk2noatt2 2.
@1686 pk1pk2noatt3 2.
@1688 pk1pk2noatt4 2.
@1690 pk1pk2noatt9 2.
@1692 cl1endtimhrs 2.
@1694 cl1endtimmin 2.
@1696 cl1endtmampm 2.
@1698 r1dnhatssppb 6.
@1704 r1dnhatsbasc 6.
@1710 r1dnhatswksc 6.
@1716 r1dnhatschsc 6.
@1722 r1dnhatsgrav 6.
@1728 r1dnhatsgrb 6.
@1734 r1dnhatspkav 6.
@1740 r1dnhatspkb 6.
@1746 r1dsppbmiss 6.
@1752 r1dorigsppb 6.
@1758 r1dorigbasc 6.
@1764 r1dorigwksc 6.
@1770 r1dorigchsc 6.
@1776 hw1currweigh 3.
@1779 hw1weighat50 3.
@1782 hw1lst10pnds 2.
@1784 hw1trytolose 2.
@1786 hw1howtallft 2.
@1788 hw1howtallin 3.
@1791 hw1tal50feet 2.
@1793 hw1tal50inch 3.
@1796 el1borninus 2.
@1798 el1hlthchild 2.
@1800 el1fingrowup 2.
@1802 el1lvbhpar15 2.
@1804 el1lvwmofaor 2.
@1806 el1higstschl 2.
@1808 el1mothalive 2.
@1810 el1fathalive 2.
@1812 el1dage2us 4.
@1816 el1dsameres 2.
@1818 rl1condspanh 2.
@1820 rl1spkothlan 2.
@1822 rl1unspokeng 2.
@1824 rl1spkengwel 2.
@1826 rl1dracehisp 2.
@1828 va1serarmfor 2.
@1830 va1memnatgrd 2.
@1832 wb1offelche1 2.
@1834 wb1offelche2 2.
@1836 wb1offelche3 2.
@1838 wb1offelche4 2.
@1840 wb1truestme1 2.
@1842 wb1truestme2 2.
@1844 wb1truestme3 2.
@1846 wb1truestme4 2.
@1848 wb1ageyofeel 3.
@1851 wb1agrwstmt1 2.
@1853 wb1agrwstmt2 2.
@1855 wb1agrwstmt3 2.
@1857 ip1covmedcad 2.
@1859 ip1otdrugcov 2.
@1861 ip1mgapmedsp 2.
@1863 ip1cmedicaid 2.
@1865 ip1covtricar 2.
@1867 ip1nginsnurs 2.
@1869 ip1typcarco1 2.
@1871 ip1typcarco2 2.
@1873 ip1typcarco3 2.
@1875 ip1paypremms 2.
@1877 ip1longhadpl 2.
@1879 ip1numyears 2.
@1881 ip1agepurpol 2.
@1883 lf1workfpay 2.
@1885 lf1abstlstwk 2.
@1887 lf1wrkplstmn 2.
@1889 lf1mrthnonjb 2.
@1891 lf1hrswkwork 3.
@1894 lf1hrwrkltwk 3.
@1897 lf1hrwrklstw 3.
@1900 lf1oftpaid 2.
@1902 lf1lstpaychk 8.
@1910 lf1pychkamnt 8.
@1918 lf1perhrpay 6.2
@1924 lf1perdaypay 4.
@1928 lf1ernfrmwrk 8.
@1936 lf1occupaton 3.
@1939 lf1doccpctgy 3.
@1942 lf1diffwrknw 2.
@1944 lf1huswifwrk 2.
@1946 lf1huwpaearn 8.
@1954 hp1ownrentot 2.
@1956 hp1mrtpadoff 2.
@1958 hp1mthlymort 8.
@1966 hp1mortpaymt 8.
@1974 hp1whnpayoff 2.
@1976 hp1amtstlowe 8.
@1984 hp1amoutowed 8.
@1992 hp1homevalue 8.
@2000 hp1homvalamt 9.
@2009 hp1payrent 2.
@2011 hp1rentamt 8.
@2019 hp1rentamout 8.
@2027 hp1sec8pubsn 2.
@2029 ia1recsspa1 2.
@2031 ia1recsspa2 2.
@2033 ia1recsspa3 2.
@2035 ia1howrecssp 2.
@2037 ia1recssils1 2.
@2039 ia1recssils2 2.
@2041 ia1recssils3 2.
@2043 ia1rvapayls1 2.
@2045 ia1rvapayls2 2.
@2047 ia1rvapayls3 2.
@2049 ia1penjobou1 2.
@2051 ia1penjobou2 2.
@2053 ia1penjobou3 2.
@2055 ia1iraothac1 2.
@2057 ia1iraothac2 2.
@2059 ia1iraothac3 2.
@2061 ia1mutfdstk1 2.
@2063 ia1mutfdstk2 2.
@2065 ia1mutfdstk3 2.
@2067 ia1mutfdstk4 2.
@2069 ia1ownbond1 2.
@2071 ia1ownbond2 2.
@2073 ia1ownbond3 2.
@2075 ia1ownbond4 2.
@2077 ia1bnkacccd1 2.
@2079 ia1bnkacccd2 2.
@2081 ia1bnkacccd3 2.
@2083 ia1bnkacccd4 2.
@2085 ia1bnkacccd5 2.
@2087 ia1bnkacccd6 2.
@2089 ia1bnkacccd7 2.
@2091 ia1bnkacccd8 2.
@2093 ia1bnkacccd9 2.
@2095 ia1bnkaccc10 2.
@2097 ia1bnkaccc11 2.
@2099 ia1bnkaccc12 2.
@2101 ia1realestt1 2.
@2103 ia1realestt2 2.
@2105 ia1realestt3 2.
@2107 ia1realestt4 2.
@2109 ia1ssrrpymnt 2.
@2111 ia1ssrrjtamt 8.
@2119 ia1ssrrjtest 2.
@2121 ia1ssrrspamt 8.
@2129 ia1ssrrspest 2.
@2131 ia1ssrrptamt 8.
@2139 ia1ssrrptest 2.
@2141 ia1ssipymnt 2.
@2143 ia1ssijtamt 8.
@2151 ia1ssijtest 2.
@2153 ia1ssispamt 8.
@2161 ia1ssispest 2.
@2163 ia1ssiptamt 8.
@2171 ia1ssiptest 2.
@2173 ia1vapymnt 2.
@2175 ia1vajtamt 8.
@2183 ia1vajtest 2.
@2185 ia1vaspamt 8.
@2193 ia1vaspest 2.
@2195 ia1vaptamt 8.
@2203 ia1vaptest 2.
@2205 ia1penpymt 2.
@2207 ia1penjtamt 8.
@2215 ia1penjtest 2.
@2217 ia1penspamt 8.
@2225 ia1penspest 2.
@2227 ia1penptamt 8.
@2235 ia1penptest 2.
@2237 ia1retworth 2.
@2239 ia1retjtwrt 8.
@2247 ia1retjtest 2.
@2249 ia1retspwrt 8.
@2257 ia1retspest 2.
@2259 ia1retptwrt 8.
@2267 ia1retptest 2.
@2269 ia1rtlmwdrw 2.
@2271 ia1rtlmjtwdr 8.
@2279 ia1rtlmjtest 2.
@2281 ia1rtlmspwdr 8.
@2289 ia1rtlmspest 2.
@2291 ia1rtlmptwdr 8.
@2299 ia1rtlmptest 2.
@2301 ia1rtyrwdrw 2.
@2303 ia1rtyrjtamt 8.
@2311 ia1rtyrjtest 2.
@2313 ia1rtyrspamt 8.
@2321 ia1rtyrspest 2.
@2323 ia1rtyrptamt 8.
@2331 ia1rtyrptest 2.
@2333 ia1skbdwrth 2.
@2335 ia1skbdjtwrt 8.
@2343 ia1skbdjtest 2.
@2345 ia1bndjtest 2.
@2347 ia1skbdspwrt 8.
@2355 ia1skbdspest 2.
@2357 ia1bndspest 2.
@2359 ia1skbdptwrt 8.
@2367 ia1skbdptest 2.
@2369 ia1bndptest 2.
@2371 ia1bkcdwrth 2.
@2373 ia1bkcdjtwrt 8.
@2381 ia1bkcdjtest 2.
@2383 ia1bnkjtest 2.
@2385 ia1bkcdspwrt 8.
@2393 ia1bkcdspest 2.
@2395 ia1bnkspest 2.
@2397 ia1bkcdptwrt 8.
@2405 ia1bkcdptest 2.
@2407 ia1bnkptest 2.
@2409 ia1itdvinc 2.
@2411 ia1itdvjtamt 8.
@2419 ia1itdvjtest 2.
@2421 ia1itdvspamt 8.
@2429 ia1itdvspest 2.
@2431 ia1itdvptamt 8.
@2439 ia1itdvptest 2.
@2441 ia1brewrt 2.
@2443 ia1brejtwrt 8.
@2451 ia1brejtest 2.
@2453 ia1brespwrt 8.
@2461 ia1brespest 2.
@2463 ia1breptwrt 8.
@2471 ia1breptest 2.
@2473 ia1breiinc 2.
@2475 ia1breijtamt 8.
@2483 ia1breijtest 2.
@2485 ia1breispamt 8.
@2493 ia1breispest 2.
@2495 ia1breiptamt 8.
@2503 ia1breiptest 2.
@2505 ia1totinc 8.
@2513 ia1toincimf 2.
@2515 ia1toincim1 8.
@2523 ia1toincim2 8.
@2531 ia1toincim3 8.
@2539 ia1toincim4 8.
@2547 ia1toincim5 8.
@2555 ia1toincesjt 8.
@2563 ia1eincimjf 4.
@2567 ia1eincimj1 2.
@2569 ia1eincimj2 2.
@2571 ia1eincimj3 2.
@2573 ia1eincimj4 2.
@2575 ia1eincimj5 2.
@2577 ia1toincessg 2.
@2579 ia1eincimsf 4.
@2583 ia1eincims1 2.
@2585 ia1eincims2 2.
@2587 ia1eincims3 2.
@2589 ia1eincims4 2.
@2591 ia1eincims5 2.
@2593 co1owncartrv 2.
@2595 co1manyvhcls 2.
@2597 co1valuevehi 8.
@2605 co1vehivalue 2.
@2607 ew1pycredbal 2.
@2609 ew1crecardeb 2.
@2611 ew1credcdmed 2.
@2613 ew1amtcrdmed 2.
@2615 ew1medpaovtm 2.
@2617 ew1ampadovrt 2.
@2619 ew1finhlpfam 2.
@2621 ew1whohelfi1 2.
@2623 ew1whohelfi2 2.
@2625 ew1atchhelyr 2.
@2627 ew1fingftfam 2.
@2629 ew1whregoth1 2.
@2631 ew1whregoth2 2.
@2633 ew1whregoth3 2.
@2635 ew1amthlpgiv 2.
@2637 ew1progneed1 2.
@2639 ew1progneed2 2.
@2641 ew1progneed3 2.
@2643 ls1evdayact1 2.
@2645 ls1evdayact2 2.
@2647 ls1evdayact3 2.
@2649 ls1evdayact4 2.
@2651 ls1evdayact5 2.
@2653 ls1evdayact6 2.
@2655 ls1evdayact7 2.
@2657 ls1evdayact8 2.
@2659 ls1ableto1 2.
@2661 ls1ableto2 2.
@2663 ls1ableto3 2.
@2665 ls1ableto4 2.
@2667 ls1ableto5 2.
@2669 ls1ableto6 2.
@2671 ls1ableto7 2.
@2673 ls1diskefrm1 2.
@2675 ls1diskefrm2 2.
@2677 ls1diskefrm3 2.
@2679 ls1diskefrm4 2.
@2681 ls1diskefrm5 2.
@2683 ls1diskefrm6 2.
@2685 ls1diskefrm7 2.
@2687 ir1spattitud 2.
@2689 ir1undrstand 2.
@2691 ir1sppresent 2.
@2693 ir1intvwhlp 2.
@2695 ir1prsnhlp1 2.
@2697 ir1prsnhlp2 2.
@2699 ir1prsnhlp3 2.
@2701 ir1prsnhlp4 2.
@2703 ir1prsnhlp5 2.
@2705 ir1prsnhlp6 2.
@2707 ir1prsnhlp91 2.
@2709 ir1sessions 2.
@2711 ir1sessrsn1 2.
@2713 ir1sessrsn2 2.
@2715 ir1sessrsn3 2.
@2717 ir1sessrsn91 2.
@2719 ir1conhomapt 2.
@2721 ir1insidhome 2.
@2723 ir1condihom1 2.
@2725 ir1condihom2 2.
@2727 ir1condihom3 2.
@2729 ir1condihom4 2.
@2731 ir1condihom5 2.
@2733 ir1clutterr1 2.
@2735 ir1clutterr2 2.
@2737 ir1areacond1 2.
@2739 ir1areacond2 2.
@2741 ir1areacond3 2.
@2743 ir1areacond4 2.
@2745 ir1condhome1 2.
@2747 ir1condhome2 2.
@2749 ir1condhome3 2.
@2751 ir1condhome4 2.
@2753 ir1condhome5 2.
@2755 ir1fqphnprsn 2.
@2757 fq1dfacdescr 2.
@2759 FQ1DOSFACD 2.
@2761 fq1prtlivnam 2.
@2763 fq1dfacarea 2.
@2765 FQ1DOSFACA 3.
@2768 fq1assdnrsng 2.
@2770 fq1othrlevls 2.
@2772 fq1whotlevl1 2.
@2774 fq1whotlevl2 2.
@2776 fq1whotlevl3 2.
@2778 fq1whotlevl4 2.
@2780 fq1whotlevl5 2.
@2782 fq1servaval1 2.
@2784 fq1servaval2 2.
@2786 fq1servaval3 2.
@2788 fq1servaval4 2.
@2790 fq1servaval5 2.
@2792 fq1servaval6 2.
@2794 fq1servaval7 2.
@2796 fq1servaval8 2.
@2798 fq1servaval9 2.
@2800 fq1paysourc1 8.
@2808 fq1paysourc2 8.
@2816 fq1paysourc3 8.
@2824 fq1paysourc4 8.
@2832 fq1paysourc5 8.
@2840 fq1paysourc6 8.
@2848 fq1totalpaym 2.
@2850 fq1mnthlyamt 8.
@2858 fq1primpayer 2.
@2860 fq1govsource 2.
@2862 fq1dlocsp 3.
@2865 w1anfinwgt0 18.11
@2883 w1anfinwgt1 18.11
@2901 w1anfinwgt2 18.11
@2919 w1anfinwgt3 18.11
@2937 w1anfinwgt4 18.11
@2955 w1anfinwgt5 18.11
@2973 w1anfinwgt6 18.11
@2991 w1anfinwgt7 18.11
@3009 w1anfinwgt8 18.11
@3027 w1anfinwgt9 18.11
@3045 w1anfinwgt10 18.11
@3063 w1anfinwgt11 18.11
@3081 w1anfinwgt12 18.11
@3099 w1anfinwgt13 18.11
@3117 w1anfinwgt14 18.11
@3135 w1anfinwgt15 18.11
@3153 w1anfinwgt16 18.11
@3171 w1anfinwgt17 18.11
@3189 w1anfinwgt18 18.11
@3207 w1anfinwgt19 18.11
@3225 w1anfinwgt20 18.11
@3243 w1anfinwgt21 18.11
@3261 w1anfinwgt22 18.11
@3279 w1anfinwgt23 18.11
@3297 w1anfinwgt24 18.11
@3315 w1anfinwgt25 18.11
@3333 w1anfinwgt26 18.11
@3351 w1anfinwgt27 18.11
@3369 w1anfinwgt28 18.11
@3387 w1anfinwgt29 18.11
@3405 w1anfinwgt30 18.11
@3423 w1anfinwgt31 18.11
@3441 w1anfinwgt32 18.11
@3459 w1anfinwgt33 18.11
@3477 w1anfinwgt34 18.11
@3495 w1anfinwgt35 18.11
@3513 w1anfinwgt36 18.11
@3531 w1anfinwgt37 18.11
@3549 w1anfinwgt38 18.11
@3567 w1anfinwgt39 18.11
@3585 w1anfinwgt40 18.11
@3603 w1anfinwgt41 18.11
@3621 w1anfinwgt42 18.11
@3639 w1anfinwgt43 18.11
@3657 w1anfinwgt44 18.11
@3675 w1anfinwgt45 18.11
@3693 w1anfinwgt46 18.11
@3711 w1anfinwgt47 18.11
@3729 w1anfinwgt48 18.11
@3747 w1anfinwgt49 18.11
@3765 w1anfinwgt50 18.11
@3783 w1anfinwgt51 18.11
@3801 w1anfinwgt52 18.11
@3819 w1anfinwgt53 18.11
@3837 w1anfinwgt54 18.11
@3855 w1anfinwgt55 18.11
@3873 w1anfinwgt56 18.11
@3891 w1varstrat 2.
@3893 w1varunit 2.;

/* Section #3 - format assignment statement   */
format r1dresid R1DRESID.
r1dresidr R1DRES_R.
r1breakoffst RFDK_Y.

is1resptype W000025W.
is1reasnprx1 W000005W.
is1reasnprx2 W000005W.
is1reasnprx3 W000005W.
is1reasnprx4 W000005W.
is1reasnprx5 W000005W.
is1reasnprx6 W000005W.
is1reasnprx9 W000005W.
r1dgender GENDER.
r1d2intvrage DINTAGEC.
is1prxyrelat W000028W.
is1prxygendr W000002W.
is1famrrutin W000029W.

re1resistrct W000030W.
re1bldgfl W000021W.
re1dcensdiv CENDIV.
fl1structure W000020W.
fl1bldgfl W000021W.
hc1health W000031W.
hc1disescn1 W000005W.
hc1disescn2 W000005W.
hc1disescn3 W000005W.
hc1disescn4 W000005W.
hc1disescn5 W000005W.
hc1disescn6 W000005W.
hc1disescn7 W000005W.
hc1disescn8 W000005W.
hc1disescn9 W000005W.
hc1disescn10 W000005W.
hc1cancerty1 W000005W.
hc1dementage RFDK_F.
hc1brokebon1 W000005W.
hc1brokebon2 W000005W.
hc1serdisill W000005W.
hc1hosptstay W000005W.
hc1hosovrnht RFDK_F.
hc1kneesurg W000005W.
hc1knesrgyr W000005W.
hc1ageknesur RFDK_F.
hc1hipsurg W000005W.
hc1hipsrgyr W000005W.
hc1agehipsur RFDK_F.
hc1catarsurg W000005W.
hc1catrsrgyr W000005W.
hc1agecatsur RFDK_F.
hc1bckspnsur W000005W.
hc1backsrgyr W000005W.
hc1agebcksrg RFDK_F.
hc1heartsurg W000005W.
hc1hartsrgyr W000005W.
hc1agehrtsrg RFDK_F.
hc1fllsinmth W000005W.
hc1worryfall W000005W.
hc1worrylimt W000005W.
hc1faleninyr W000005W.
hc1multifall W000005W.
hc1depresan1 W000033W.
hc1depresan2 W000033W.
hc1depresan3 W000033W.
hc1depresan4 W000033W.
hc1aslep30mn W000034W.
hc1trbfalbck W000035W.
hc1sleepmed W000034W.
ht1longlived W000036W.
ht1mthslived RFDK_F.
ht1yrslived RFDK_F.
ht1longer5yr W000005W.
ht1placedesc W000037W.
ht1retiresen W000005W.
ht1diffareun W000005W.
ht1helpmedbd W000005W.
ht1meals W000005W.
ht1spacename W000039W.
fl1facility W000005W.
fl1hotype W000024W.
fl1retirecom W000005W.
se1servcoff1 W000005W.
se1servcoff2 W000005W.
se1servcoff3 W000005W.
se1servcoff4 W000005W.
se1servcoff5 W000005W.
se1servcoff6 W000005W.
se1servcoff7 W000005W.
se1servcoff8 W000005W.
se1servcoff9 W000005W.
se1servused1 W000005W.
se1servused2 W000005W.
se1servused3 W000005W.
se1servused4 W000005W.
se1servused5 W000005W.
se1servused6 W000005W.
se1servused7 W000005W.
se1servused8 W000005W.
se1servused9 W000005W.
se1payservi1 W000165W.
se1payservi2 W000165W.
se1payservi3 W000165W.
se1payservi4 W000165W.
se1payservi5 W000165W.
se1payservi6 W000165W.
se1payservi7 W000165W.
se1payservi8 W000165W.
se1payservi9 W000165W.
hh1martlstat W000010W.
hh1yrendmarr RFDK_F.
hh1yrsmarliv RFDK_F.
hh1spgender W000002W.
hh1d2spouage DSPSAGEC.
hh1spouseduc W000012W.
hh1spoupchlp W000005W.
hh1livwthspo W000005W.
hh1placekind W000040W.
hh1proxlivsp W000005W.
hh1othlvhere W000005W.
hh1dspouseid $SPOUSEID.
hh1dlvngarrg DLVNGARR.
hh1dhshldnum INAPMISS.
hh1dhshldchd INAPMISS.
cs1dreconcil CS1D_F.
cs1sistrsnum RFDK_F.
cs1brthrsnum RFDK_F.
cs1dnumchild INAPMI_S.
cs1dnmstpchd INAPMISS.
cs1dnumdaugh INAPMISS.
cs1dnumson INAPMISS.
sn1dnumsn INAPMISS.
fl1noonetalk W000005W.
ho1entrstair W000005W.
ho1entrccomn W000044W.
ho1entrnramp W000005W.
ho1bldgamen1 W000005W.
ho1bldgamen2 W000005W.
ho1bldgamen3 W000005W.
ho1bldgamen4 W000005W.
ho1levelsflr W000045W.
ho1homeamen1 W000005W.
ho1homeamen2 W000005W.
ho1homeamen3 W000005W.
ho1bathprivt W000005W.
ho1bathamen1 W000005W.
ho1bathamen2 W000005W.
ho1bathamen3 W000005W.
ho1bathamen4 W000005W.
ho1bathamen5 W000005W.
ho1bathamen6 W000005W.
ho1bathamen7 W000005W.
ho1kitchnprv W000005W.
ho1kitchncom W000005W.
ho1microwave W000005W.
fl1onefloor W000005W.
fl1bathgrbbr W000005W.
fl1bathseat W000005W.
fl1raisedtlt W000005W.
fl1tltgrbbr W000005W.
em1modhere1 W000046W.
em1addlstyr1 W000005W.
em1addlstyr2 W000005W.
em1addlstyr3 W000005W.
em1addlstyr4 W000005W.
em1addlstyr5 W000005W.
em1addlstyr6 W000005W.
em1addlstyr7 W000005W.
em1payyufam1 W000005W.
em1payyufam2 W000005W.
em1payyufam3 W000005W.
em1payyufam4 W000005W.
em1payyufam5 W000005W.
em1payyufam6 W000005W.
em1payyufam7 W000005W.
em1paydevce1 W000005W.
em1paydevce2 W000005W.
em1paydevce3 W000005W.
em1paydevce4 W000005W.
em1paydevce5 W000005W.
em1paydevce6 W000005W.
em1paydevce7 W000005W.
em1paydevce8 W000005W.
em1paydevce9 W000005W.
em1payaltgth W000047W.
em1morls1000 W000048W.
em1morls100 W000049W.
cm1knowwell W000099W.
cm1willnghlp W000099W.
cm1peoptrstd W000099W.
te1cellphone W000005W.
te1othrphone W000005W.
te1computer W000050W.
te1compoth W000005W.
te1emailtext W000005W.
te1oftnemail W000051W.
te1online W000005W.
te1shoponli1 W000005W.
te1shoponli2 W000005W.
te1shoponli3 W000005W.
te1intrntmd1 W000005W.
te1intrntmd2 W000005W.
te1intrntmd3 W000005W.
md1canewlker W000005W.
md1cane W000005W.
md1walker W000005W.
md1wheelchar W000005W.
md1whelcrspc W000005W.
md1scooter W000005W.
md1scterinsp W000005W.
fl1cane W000005W.
fl1walker W000005W.
fl1wheelchr W000005W.
fl1whlchrhom W000005W.
fl1scooter W000005W.
fl1scooterhm W000005W.
ss1heringaid W000053W.
ss1hearphone W000005W.
ss1convwradi W000005W.
ss1convquiet W000005W.
ss1glasseswr W000054W.
ss1seewellst W000005W.
ss1seestvgls W000005W.
ss1glasscls W000005W.
ss1othvisaid W000005W.
ss1glrednewp W000005W.
ss1probchswl W000005W.
ss1probspeak W000005W.
ss1painbothr W000005W.
ss1painlimts W000005W.
ss1painmedof W000055W.
ss1painwhe1 W000005W.
ss1painwhe2 W000005W.
ss1painwhe3 W000005W.
ss1painwhe4 W000005W.
ss1painwhe5 W000005W.
ss1painwhe6 W000005W.
ss1painwhe7 W000005W.
ss1painwhe8 W000005W.
ss1painwhe9 W000005W.
ss1painwhe10 W000005W.
ss1painwhe11 W000005W.
ss1painwhe12 W000005W.
ss1painwhe13 W000005W.
ss1probbreat W000005W.
ss1prbbrlimt W000005W.
ss1strnglmup W000005W.
ss1uplimtact W000005W.
ss1lwrbodstr W000005W.
ss1lwrbodimp W000005W.
ss1lowenergy W000005W.
ss1loenlmtat W000005W.
ss1prbbalcrd W000005W.
ss1prbbalcnt W000005W.
pc1walk6blks W000005W.
pc1walk3blks W000005W.
pc1up20stair W000005W.
pc1up10stair W000005W.
pc1car20pnds W000005W.
pc1car10pnds W000005W.
pc1geonknees W000005W.
pc1bendover W000005W.
pc1hvobovrhd W000005W.
pc1rechovrhd W000005W.
pc1opnjarwhd W000005W.
pc1grspsmobj W000005W.
cp1memrygood W000031W.
cp1knownspyr W000005W.
cp1chgthink1 W000057W.
cp1chgthink2 W000057W.
cp1chgthink3 W000057W.
cp1chgthink4 W000057W.
cp1chgthink5 W000057W.
cp1chgthink6 W000057W.
cp1chgthink7 W000057W.
cp1chgthink8 W000057W.
cp1memcogpr1 W000005W.
cp1memcogpr2 W000005W.
cp1memcogpr3 W000005W.
cp1memcogpr4 W000005W.
cg1speaktosp W000005W.
cg1quesremem W000005W.
cg1reascano1 W000005W.
cg1reascano2 W000005W.
cg1reascano3 W000005W.
cg1reascano4 W000005W.
cg1reascano5 W000005W.
cg1reascano6 W000005W.
cg1reascano7 W000005W.
cg1reascano8 W000005W.
cg1reascano9 W000005W.
cg1ratememry W000031W.
cg1ofmemprob W000055W.
cg1memcom1yr W000059W.
cg1todaydat1 W000060W.
cg1todaydat2 W000060W.
cg1todaydat3 W000060W.
cg1todaydat4 W000060W.
cg1todaydat5 W000060W.
cg1prewrdrcl W000061W.
cg1dwrdlstnm WORDREC.
cg1wrdsrcal1 W000062W.
cg1wrdsrcal2 W000062W.
cg1wrdsrcal3 W000062W.
cg1wrdsrcal4 W000062W.
cg1wrdsrcal5 W000062W.
cg1wrdsrcal6 W000062W.
cg1wrdsrcal7 W000062W.
cg1wrdsrcal8 W000062W.
cg1wrdsrcal9 W000062W.
cg1wrdsrca10 W000062W.
cg1dwrdimmrc WORDRE_N.
cg1dwrdinone WORDRECO.
cg1dwrdirref WORDRECP.
cg1wrdsntlst W000005W.
cg1numnotlst RFDK_F.
cg1probreca1 W000005W.
cg1probreca2 W000005W.
cg1probreca3 W000005W.
cg1probreca4 W000005W.
cg1dclkdraw DCLCKSC.
cg1dclkimgcl DCLCKCL.
cg1atdrwclck W000064W.
cg1presidna1 W000005W.
cg1presidna2 W000005W.
cg1presidna3 W000005W.
cg1presidna4 W000005W.
cg1vpname1 W000005W.
cg1vpname2 W000005W.
cg1vpname3 W000005W.
cg1vpname4 W000005W.
cg1wrdsdcal1 W000062W.
cg1wrdsdcal2 W000062W.
cg1wrdsdcal3 W000062W.
cg1wrdsdcal4 W000062W.
cg1wrdsdcal5 W000062W.
cg1wrdsdcal6 W000062W.
cg1wrdsdcal7 W000062W.
cg1wrdsdcal8 W000062W.
cg1wrdsdcal9 W000062W.
cg1wrdsdca10 W000062W.
cg1dwrddlyrc WORDRE_N.
cg1dwrddnone WORDRECO.
cg1dwrddrref WORDRECP.
cg1wrdnotlst W000005W.
cg1numwrdnot RFDK_F.
cg1dwrd1rcl WORDRECN.
cg1dwrd2rcl WORDRECN.
cg1dwrd3rcl WORDRECN.
cg1dwrd4rcl WORDRECN.
cg1dwrd5rcl WORDRECN.
cg1dwrd6rcl WORDRECN.
cg1dwrd7rcl WORDRECN.
cg1dwrd8rcl WORDRECN.
cg1dwrd9rcl WORDRECN.
cg1dwrd10rcl WORDRECN.
cg1dwrd1dly WORDRECN.
cg1dwrd2dly WORDRECN.
cg1dwrd3dly WORDRECN.
cg1dwrd4dly WORDRECN.
cg1dwrd5dly WORDRECN.
cg1dwrd6dly WORDRECN.
cg1dwrd7dly WORDRECN.
cg1dwrd8dly WORDRECN.
cg1dwrd9dly WORDRECN.
cg1dwrd10dly WORDRECN.
mo1outoft W000066W.
mo1outcane W000067W.
mo1outwalkr W000067W.
mo1outwlchr W000067W.
mo1outsctr W000067W.
mo1outhlp W000005W.
mo1outslf W000069W.
mo1outdif W000070W.
mo1outyrgo W000071W.
mo1outwout W000005W.
mo1oftgoarea W000055W.
mo1oflvslepr W000055W.
mo1insdcane W000067W.
mo1insdwalkr W000067W.
mo1insdwlchr W000067W.
mo1insdsctr W000067W.
mo1oftholdwl W000067W.
mo1insdhlp W000005W.
mo1insdslf W000069W.
mo1insddif W000070W.
mo1insdyrgo W000071W.
mo1insdwout W000005W.
mo1beddev W000067W.
mo1bedhlp W000005W.
mo1bedslf W000069W.
mo1beddif W000070W.
mo1bedwout W000005W.
mo1doutsfdf MDOUTSLF.
mo1doutdevi MDOUTDEV.
mo1douthelp MDOUTHLP.
mo1dinsdsfdf MODINSLF.
mo1dinsddevi MODINDEV.
mo1dinsdhelp MODINHLP.
mo1dbedsfdf MDBEDSLF.
mo1dbeddevi MDBEDDEV.
mo1dbedhelp MDBEDHLP.
fl1didntleav W000005W.
fl1ntlvrmslp W000005W.
dm1helpmobil W000005W.
dm1helpyrmor W000072W.
dm1yrsgethlp DMGETHLP.
dm1mthgethlp W000073W.
dm1lstyrcane W000005W.
dm1caneforyr W000072W.
dm1yrsuscane RFDK_F.
dm1mtfrtcane W000073W.
dm1mobhelp65 W000005W.
dm1snc65mohl W000005W.
dm1at65uscan W000005W.
dm1snc65uscn W000005W.
dm1dhlpyr DMDHLPYR.
dm1dhlpst DMDHLPST.
dm1dhlpend DMDHLPEN.
dm1dhlpyrs DMHLPYRS.
dm1ddeviyr DMDDEVYR.
dm1ddevist DMDEVST.
dm1ddeviend DMDEVEND.
dm1ddeviyrs DMHLPYRS.
dt1oftedrive W000055W.
dt1lastdrove W000074W.
dt1mthltdrov W000073W.
dt1yrlstdrov RFDK_F.
dt1mthagodrv RFDK_F.
dt1yragoldrv RFDK_F.
dt1ageltdrov RFDK_F.
dt1avoidriv1 W000075W.
dt1avoidriv2 W000075W.
dt1avoidriv3 W000075W.
dt1avoidriv4 W000075W.
dt1getoplcs1 W000005W.
dt1getoplcs2 W000005W.
dt1getoplcs3 W000005W.
dt1getoplcs4 W000005W.
dt1getoplcs5 W000005W.
dt1getoplcs6 W000005W.
dt1getoplcs7 W000005W.
dt1otfrfamtk W000005W.
fl1drives W000005W.
fl1drvlstyr W000005W.
ha1laun W000076W.
ha1launslf W000005W.
ha1whrmachi1 W000005W.
ha1whrmachi2 W000005W.
ha1whrmachi3 W000005W.
ha1whrmachi4 W000005W.
ha1whrmachi5 W000005W.
ha1whrmachi6 W000005W.
ha1dlaunreas HADLOTH.
ha1laundif W000070W.
ha1launoft W000079W.
ha1launwout W000005W.
ha1shop W000076W.
ha1shopslf W000005W.
ha1howpaygr1 W000005W.
ha1howpaygr2 W000005W.
ha1howpaygr3 W000005W.
ha1howpaygr4 W000005W.
ha1howpaygr5 W000005W.
ha1howpaygr6 W000005W.
ha1howpaygr7 W000005W.
ha1howgtstr1 W000005W.
ha1howgtstr2 W000005W.
ha1howgtstr3 W000005W.
ha1howgtstr4 W000005W.
ha1howgtstr5 W000005W.
ha1howgtstr6 W000005W.
ha1howgtstr7 W000005W.
ha1howgtstr8 W000005W.
ha1shopcart W000005W.
ha1shoplean W000005W.
ha1dshopreas HADSHOTH.
ha1shopdif W000070W.
ha1shopoft W000079W.
ha1shopwout W000005W.
ha1meal W000076W.
ha1mealslf W000005W.
ha1restamels W000067W.
ha1oftmicrow W000067W.
ha1dmealreas HADMLOTH.
ha1mealdif W000070W.
ha1mealoft W000079W.
ha1mealwout W000005W.
ha1bank W000076W.
ha1bankslf W000005W.
ha1dbankreas HADBBOTH.
ha1bankdif W000070W.
ha1bankoft W000079W.
ha1bankwout W000005W.
ha1money W000005W.
ha1moneyhlp W000005W.
ha1dlaunsfdf HADLSLF.
ha1dshopsfdf HADSHSLF.
ha1dmealsfdf HADMLSLF.
ha1dbanksfdf HADBBSLF.
ha1dmealwhl RFDK_Y.
ha1dmealtkot RFDK_Y.
sc1eatdev W000083W.
sc1eatdevoft W000084W.
sc1eathlp W000005W.
sc1eatslfoft W000069W.
sc1eatslfdif W000070W.
sc1eatwout W000005W.
sc1showrbat1 W000005W.
sc1showrbat2 W000005W.
sc1showrbat3 W000005W.
sc1prfrshbth W000086W.
sc1scusgrbrs W000067W.
sc1shtubseat W000067W.
sc1bathhlp W000005W.
sc1bathoft W000069W.
sc1bathdif W000070W.
sc1bathyrgo W000079W.
sc1bathwout W000005W.
sc1usvartoi1 W000005W.
sc1usvartoi2 W000005W.
sc1usvartoi3 W000005W.
sc1usvartoi4 W000005W.
sc1toilhlp W000005W.
sc1toiloft W000069W.
sc1toildif W000070W.
sc1toilwout W000005W.
sc1dresoft W000055W.
sc1dresdev W000005W.
sc1dreshlp W000005W.
sc1dresslf W000069W.
sc1dresdif W000070W.
sc1dresyrgo W000079W.
sc1dreswout W000005W.
sc1deatdevi SCEATDEV.
sc1deathelp SCEATHLP.
sc1deatsfdf SCEATDIF.
sc1dbathdevi SCDBADEV.
sc1dbathhelp SCBTHHLP.
sc1dbathsfdf SCDBADIF.
sc1dtoildevi SCTLTDEV.
sc1dtoilhelp SCTLTHLP.
sc1dtoilsfdf SCDTODIF.
sc1ddresdevi DDRDEV.
sc1ddreshelp DDRHLP.
sc1ddressfdf DDRDIF.
fl1showering W000005W.
fl1takingbth W000005W.
fl1washingup W000005W.
ds1gethlpeat W000005W.
ds1hlpmrtnyr W000072W.
ds1yrsgethlp DMGETHLP.
ds1mthgethlp W000073W.
ds1gthptrn65 W000005W.
ds1gthpsin65 W000005W.
ds1dhlpyr DSDHLPYR.
ds1dhlpst DHLPST.
ds1dhlpend DHLPEND.
ds1dhlpyrs DSHLPYRS.
mc1meds W000005W.
mc1medstrk W000076W.
mc1medsslf W000005W.
mc1whrgtmed1 W000005W.
mc1whrgtmed2 W000005W.
mc1whrgtmed3 W000005W.
mc1whrgtmed4 W000005W.
mc1howpkupm1 W000005W.
mc1howpkupm2 W000005W.
mc1howpkupm3 W000005W.
mc1medsrem W000067W.
mc1dmedsreas DPMOTH.
mc1medsdif W000070W.
mc1medsyrgo W000079W.
mc1medsmis W000005W.
mc1havregdoc W000005W.
mc1regdoclyr W000005W.
mc1hwgtregd1 W000005W.
mc1hwgtregd2 W000005W.
mc1hwgtregd3 W000005W.
mc1hwgtregd4 W000005W.
mc1hwgtregd5 W000005W.
mc1hwgtregd6 W000005W.
mc1hwgtregd7 W000005W.
mc1hwgtregd8 W000005W.
mc1hwgtregd9 W000005W.
mc1ansitindr W000005W.
mc1tpersevr1 W000005W.
mc1tpersevr2 W000005W.
mc1tpersevr3 W000005W.
mc1tpersevr4 W000005W.
mc1chginspln W000005W.
mc1anhlpwdec W000005W.
mc1dmedssfdf DPMSLF.
pa1vistfrfam W000005W.
pa1hlkepfvst W000005W.
pa1trkpfrvis W000005W.
pa1impvstfam W000091W.
pa1attrelser W000005W.
pa1htkfrrlsr W000005W.
pa1trprrelsr W000005W.
pa1imprelser W000091W.
pa1clbmtgrac W000005W.
pa1hlkpfrclb W000005W.
pa1trprkpfgr W000005W.
pa1imparclub W000091W.
pa1outfrenjy W000005W.
pa1hlkpgoenj W000005W.
pa1trprgoout W000005W.
pa1impouteny W000091W.
pa1workfrpay W000005W.
pa1hlkpfrwrk W000005W.
pa1voltrwork W000005W.
pa1hlkpfrvol W000005W.
pa1prcranoth W000005W.
pa1evrgowalk W000005W.
pa1vigoractv W000005W.
pa1helmfvact W000005W.
pa1dfavact $PA25FM.
sd1smokedreg W000005W.
sd1smokesnow W000005W.
sd1numcigday RFDK_F.
sd1agesrtsmk RFDK_F.
sd1agelstsmk RFDK_F.
pe1whhndsign W000093W.
pe1surghdwrt W000005W.
pe1surgyside W000094W.
pe1flruppain W000005W.
pe1sideflrup W000094W.
pe1surgarmsh W000005W.
pe1sidsurgar W000094W.
pe1surgyhips W000005W.
pe1sidhipsrg W000095W.
pe1stndwhold W000005W.
pe1upchbyslf W000005W.
pe1wlkdsself W000005W.
fl1lefthand W000005W.
fl1righthand W000005W.
fl1eiherhand W000005W.
fl1lftgrptst W000005W.
fl1rhtgrptst W000005W.
fl1charstnds W000005W.
fl1balstands W000005W.
fl1wlkingrse W000005W.
ba1dblssadm BA1SS.
ba1dblstadm BA1STAN.
ba1dblftadm BA1TAN.
ba1dblopadm BA1OP.
ba1dblcladm BA1CL.
wa1dwlkadm WA1WLK.
ch1dschradm CH1SCH.
ch1drchradm CH1RSH.
gr1dgripadm GR1GRIP.
wc1dwaistadm WC1WAIST.
pk1dpeakadm PK1PEAK.
in1strtmampm A0001AB.
ba1sxsresult A0003BA.
ba1blstdsecs RFDK_F.
ba1blstdhndr RFDK_F.
ba1rsn1ssstd RFDK_YN.
ba1rsn2ssstd RFDK_YN.
ba1rsn3ssstd RFDK_YN.
ba1rsn4ssstd RFDK_YN.
ba1rsn9ssstd RFDK_YN.
ba1stdmreslt A0003BA.
ba1stdmsecs RFDK_F.
ba1stdmhndr RFDK_F.
ba1rsn1ststd RFDK_YN.
ba1rsn2ststd RFDK_YN.
ba1rsn3ststd RFDK_YN.
ba1rsn4ststd RFDK_YN.
ba1rsn9ststd RFDK_YN.
ba1ftdmreslt A0003BA.
ba1ftdmsecs RFDK_F.
ba1ftdmhndr RFDK_F.
ba1rsn1ftstd RFDK_YN.
ba1rsn2ftstd RFDK_YN.
ba1rsn3ftstd RFDK_YN.
ba1rsn4ftstd RFDK_YN.
ba1rsn9ftstd RFDK_YN.
ba11leoreslt A0019BA.
ba11leosfsec RFDK_F.
ba11leohndr RFDK_F.
ba1rsn11leo RFDK_YN.
ba1rsn21leo RFDK_YN.
ba1rsn31leo RFDK_YN.
ba1rsn41leo RFDK_YN.
ba1rsn91leo RFDK_YN.
ba11lecreslt A0019BA.
ba11lecsfsec RFDK_F.
ba11lechndr RFDK_F.
ba1rsn11lec RFDK_YN.
ba1rsn21lec RFDK_YN.
ba1rsn31lec RFDK_YN.
ba1rsn41lec RFDK_YN.
ba1rsn91lec RFDK_YN.
wa1wlkcorspc A0002WA.
wa1wkaidused A0004WA.
wa1wlkc1rslt PE_COMP.
wa1wlkc1secs RFDK_F.
wa1wlk1hndr RFDK_F.
wa1rsn11wkc RFDK_YN.
wa1rsn21wkc RFDK_YN.
wa1rsn31wkc RFDK_YN.
wa1rsn41wkc RFDK_YN.
wa1rsn51wkc RFDK_YN.
wa1rsn91wkc RFDK_YN.
wa1wkaidusc2 A0004WA.
wa1wlkc2rslt PE_COMP.
wa1wlkc2secs RFDK_F.
wa1wlk2hndr RFDK_F.
wa1rsn12wkc RFDK_YN.
wa1rsn22wkc RFDK_YN.
wa1rsn32wkc RFDK_YN.
wa1rsn42wkc RFDK_YN.
wa1rsn92wkc RFDK_YN.
ch1chravail RFDK_YN.
ch1chstcompl A0004CH.
ch1chairheit RFDK_F.
ch1whlchrusd RFDK_YN.
ch1sgchstres PE_COMP.
ch1armuse A0008CH.
ch1rsn11chs RFDK_YN.
ch1rsn21chs RFDK_YN.
ch1rsn31chs RFDK_YN.
ch1rsn41chs RFDK_YN.
ch1rsn51chs RFDK_YN.
ch1rsn91chs RFDK_YN.
ch12chstrslt PE_COMP.
ch1chstndsec RFDK_F.
ch1chstdhndr RFDK_F.
ch1chstddone A0014CH.
ch1chstntdn1 RFDK_YN.
ch1chstntdn2 RFDK_YN.
ch1chstntdn3 RFDK_YN.
ch1chstntdn4 RFDK_YN.
ch1chstntdn5 RFDK_YN.
ch1chstntdn9 RFDK_YN.
ch1chstntat1 RFDK_YN.
ch1chstntat2 RFDK_YN.
ch1chstntat3 RFDK_YN.
ch1chstntat4 RFDK_YN.
ch1chstntat9 RFDK_YN.
gr1handtstd1 RGT_LFT.
gr1adjgr1ps3 RFDK_YN.
gr1grp1reslt PE_COMP.
gr1grp1rdng RFDK_F.
gr1grp1noat1 RFDK_YN.
gr1grp1noat2 RFDK_YN.
gr1grp1noat3 RFDK_YN.
gr1grp1noat4 RFDK_YN.
gr1grp1noat9 RFDK_YN.
gr1handtstd2 RGT_LFT.
gr1adjgr2ps3 RFDK_YN.
gr1grp2reslt PE_COMP.
gr1grp2rdng RFDK_F.
gr1grp2noat1 RFDK_YN.
gr1grp2noat2 RFDK_YN.
gr1grp2noat3 RFDK_YN.
gr1grp2noat4 RFDK_YN.
gr1grp2noat9 RFDK_YN.
wc1measdiff1 RFDK_YN.
wc1measdiff2 RFDK_YN.
wc1measdiff3 RFDK_YN.
wc1measdiff4 RFDK_YN.
wc1measdiff5 RFDK_YN.
wc1measdiff6 RFDK_YN.
wc1measdiff9 RFDK_YN.
wc1waistrslt PE_COMP.
wc1wstmsrinc RFDK_F.
wc1wstmsrqrt RFDK_F.
wc1wstbulkcl RFDK_Y.
wc1whomeasur PERSON.
wc1wstpostn STAND.
wc1wstnotat1 RFDK_YN.
wc1wstnotat2 RFDK_YN.
wc1wstnotat3 RFDK_YN.
wc1wstnotat4 RFDK_YN.
wc1wstnotat5 RFDK_YN.
wc1wstnotat9 RFDK_YN.
pk1pkarf1pos STAND.
pk1pkarfl1ef EFFORT.
pk1pkarfl1rs PE_COMP.
pk1pkarfl1rd RFDK_F.
pk1pk1noatt1 RFDK_YN.
pk1pk1noatt2 RFDK_YN.
pk1pk1noatt3 RFDK_YN.
pk1pk1noatt4 RFDK_YN.
pk1pk1noatt9 RFDK_YN.
pk1paf2posit STAND.
pk1pkafl3eff EFFORT.
pk1pkarfl2rs PE_COMP.
pk1pkarfl2rd RFDK_F.
pk1pk2noatt1 RFDK_YN.
pk1pk2noatt2 RFDK_YN.
pk1pk2noatt3 RFDK_YN.
pk1pk2noatt4 RFDK_YN.
pk1pk2noatt9 RFDK_YN.
cl1endtimhrs RFDK_F.
cl1endtimmin RFDK_F.
cl1endtmampm A0001AB.
r1dnhatssppb RFDK_F.
r1dnhatsbasc RFDK_F.
r1dnhatswksc RFDK_F.
r1dnhatschsc RFDK_F.
r1dnhatsgrav RFDK_F.
r1dnhatsgrb RFDK_F.
r1dnhatspkav RFDK_F.
r1dnhatspkb RFDK_F.
r1dsppbmiss R1DSPPBM.
r1dorigsppb RFDK_F.
r1dorigbasc RFDK_F.
r1dorigwksc RFDK_F.
r1dorigchsc RFDK_F.
hw1currweigh RFDK_F.
hw1weighat50 RFDK_F.
hw1lst10pnds W000005W.
hw1trytolose W000005W.
hw1howtallft RFDK_F.
hw1howtallin RFDK_F.
hw1tal50feet RFDK_F.
hw1tal50inch RFDK_F.
el1borninus W000005W.
el1hlthchild W000031W.
el1fingrowup W000096W.
el1lvbhpar15 W000005W.
el1lvwmofaor W000097W.
el1higstschl W000012W.
el1mothalive W000005W.
el1fathalive W000005W.
el1dage2us ELAGE2US.
el1dsameres DSAMERES.
rl1condspanh W000005W.
rl1spkothlan W000005W.
rl1unspokeng W000103W.
rl1spkengwel W000103W.
rl1dracehisp RACEHISP.
va1serarmfor W000005W.
va1memnatgrd W000005W.
wb1offelche1 W000055W.
wb1offelche2 W000055W.
wb1offelche3 W000055W.
wb1offelche4 W000055W.
wb1truestme1 W000105W.
wb1truestme2 W000105W.
wb1truestme3 W000105W.
wb1truestme4 W000105W.
wb1ageyofeel RFDK_F.
wb1agrwstmt1 W000105W.
wb1agrwstmt2 W000105W.
wb1agrwstmt3 W000105W.
ip1covmedcad W000005W.
ip1otdrugcov W000005W.
ip1mgapmedsp W000005W.
ip1cmedicaid W000005W.
ip1covtricar W000005W.
ip1nginsnurs W000005W.
ip1typcarco1 W000005W.
ip1typcarco2 W000005W.
ip1typcarco3 W000005W.
ip1paypremms W000107W.
ip1longhadpl W000108W.
ip1numyears RFDK_F.
ip1agepurpol RFDK_F.
lf1workfpay W000109W.
lf1abstlstwk W000109W.
lf1wrkplstmn W000005W.
lf1mrthnonjb W000005W.
lf1hrswkwork RFDK_F.
lf1hrwrkltwk RFDK_F.
lf1hrwrklstw RFDK_F.
lf1oftpaid W000110W.
lf1lstpaychk W000111W.
lf1pychkamnt RFDK_F.
lf1perhrpay RFDK_F.
lf1perdaypay RFDK_F.
lf1ernfrmwrk RFDK_F.
lf1occupaton W000112W.
lf1doccpctgy OCCCODE.
lf1diffwrknw W000113W.
lf1huswifwrk W000005W.
lf1huwpaearn RFDK_F.
hp1ownrentot W000114W.
hp1mrtpadoff W000115W.
hp1mthlymort RFDK_F.
hp1mortpaymt W000116W.
hp1whnpayoff W000117W.
hp1amtstlowe RFDK_F.
hp1amoutowed W000118W.
hp1homevalue RFDK_F.
hp1homvalamt W000119W.
hp1payrent W000005W.
hp1rentamt RFDK_F.
hp1rentamout W000116W.
hp1sec8pubsn W000005W.
ia1recsspa1 W000005W.
ia1recsspa2 W000005W.
ia1recsspa3 W000005W.
ia1howrecssp W000121W.
ia1recssils1 W000005W.
ia1recssils2 W000005W.
ia1recssils3 W000005W.
ia1rvapayls1 W000005W.
ia1rvapayls2 W000005W.
ia1rvapayls3 W000005W.
ia1penjobou1 W000005W.
ia1penjobou2 W000005W.
ia1penjobou3 W000005W.
ia1iraothac1 W000005W.
ia1iraothac2 W000005W.
ia1iraothac3 W000005W.
ia1mutfdstk1 W000005W.
ia1mutfdstk2 W000005W.
ia1mutfdstk3 W000005W.
ia1mutfdstk4 W000005W.
ia1ownbond1 W000005W.
ia1ownbond2 W000005W.
ia1ownbond3 W000005W.
ia1ownbond4 W000005W.
ia1bnkacccd1 W000005W.
ia1bnkacccd2 W000005W.
ia1bnkacccd3 W000005W.
ia1bnkacccd4 W000005W.
ia1bnkacccd5 W000005W.
ia1bnkacccd6 W000005W.
ia1bnkacccd7 W000005W.
ia1bnkacccd8 W000005W.
ia1bnkacccd9 W000005W.
ia1bnkaccc10 W000005W.
ia1bnkaccc11 W000005W.
ia1bnkaccc12 W000005W.
ia1realestt1 W000005W.
ia1realestt2 W000005W.
ia1realestt3 W000005W.
ia1realestt4 W000005W.
ia1ssrrpymnt W000125W.
ia1ssrrjtamt RFDK_F.
ia1ssrrjtest W000126W.
ia1ssrrspamt RFDK_F.
ia1ssrrspest W000127W.
ia1ssrrptamt RFDK_F.
ia1ssrrptest W000127W.
ia1ssipymnt W000125W.
ia1ssijtamt RFDK_F.
ia1ssijtest W000128W.
ia1ssispamt RFDK_F.
ia1ssispest W000129W.
ia1ssiptamt RFDK_F.
ia1ssiptest W000129W.
ia1vapymnt W000125W.
ia1vajtamt RFDK_F.
ia1vajtest W000130W.
ia1vaspamt RFDK_F.
ia1vaspest W000131W.
ia1vaptamt RFDK_F.
ia1vaptest W000131W.
ia1penpymt W000125W.
ia1penjtamt RFDK_F.
ia1penjtest W000132W.
ia1penspamt RFDK_F.
ia1penspest W000133W.
ia1penptamt RFDK_F.
ia1penptest W000133W.
ia1retworth W000125W.
ia1retjtwrt RFDK_F.
ia1retjtest W000134W.
ia1retspwrt RFDK_F.
ia1retspest W000135W.
ia1retptwrt RFDK_F.
ia1retptest W000135W.
ia1rtlmwdrw W000125W.
ia1rtlmjtwdr RFDK_F.
ia1rtlmjtest W000136W.
ia1rtlmspwdr RFDK_F.
ia1rtlmspest W000137W.
ia1rtlmptwdr RFDK_F.
ia1rtlmptest W000137W.
ia1rtyrwdrw W000125W.
ia1rtyrjtamt RFDK_F.
ia1rtyrjtest W000138W.
ia1rtyrspamt RFDK_F.
ia1rtyrspest W000139W.
ia1rtyrptamt RFDK_F.
ia1rtyrptest W000139W.
ia1skbdwrth W000125W.
ia1skbdjtwrt RFDK_F.
ia1skbdjtest W000140W.
ia1bndjtest W000141W.
ia1skbdspwrt RFDK_F.
ia1skbdspest W000142W.
ia1bndspest W000143W.
ia1skbdptwrt RFDK_F.
ia1skbdptest W000142W.
ia1bndptest W000143W.
ia1bkcdwrth W000125W.
ia1bkcdjtwrt RFDK_F.
ia1bkcdjtest W000144W.
ia1bnkjtest W000145W.
ia1bkcdspwrt RFDK_F.
ia1bkcdspest W000146W.
ia1bnkspest W000147W.
ia1bkcdptwrt RFDK_F.
ia1bkcdptest W000146W.
ia1bnkptest W000147W.
ia1itdvinc W000125W.
ia1itdvjtamt RFDK_F.
ia1itdvjtest W000148W.
ia1itdvspamt RFDK_F.
ia1itdvspest W000149W.
ia1itdvptamt RFDK_F.
ia1itdvptest W000149W.
ia1brewrt W000125W.
ia1brejtwrt RFDK_F.
ia1brejtest W000150W.
ia1brespwrt RFDK_F.
ia1brespest W000151W.
ia1breptwrt RFDK_F.
ia1breptest W000151W.
ia1breiinc W000125W.
ia1breijtamt RFDK_F.
ia1breijtest W000152W.
ia1breispamt RFDK_F.
ia1breispest W000153W.
ia1breiptamt RFDK_F.
ia1breiptest W000153W.
ia1totinc RFDK_F.
ia1toincimf STAT1A.
ia1toincim1 RFDK_F.
ia1toincim2 RFDK_F.
ia1toincim3 RFDK_F.
ia1toincim4 RFDK_F.
ia1toincim5 RFDK_F.
ia1toincesjt W000154W.
ia1eincimjf STAT1A.
ia1eincimj1 W000154W.
ia1eincimj2 W000154W.
ia1eincimj3 W000154W.
ia1eincimj4 W000154W.
ia1eincimj5 W000154W.
ia1toincessg W000155W.
ia1eincimsf STAT1A.
ia1eincims1 W000155W.
ia1eincims2 W000155W.
ia1eincims3 W000155W.
ia1eincims4 W000155W.
ia1eincims5 W000155W.
co1owncartrv W000005W.
co1manyvhcls RFDK_F.
co1valuevehi RFDK_F.
co1vehivalue W000156W.
ew1pycredbal W000157W.
ew1crecardeb W000158W.
ew1credcdmed W000005W.
ew1amtcrdmed W000159W.
ew1medpaovtm W000005W.
ew1ampadovrt W000160W.
ew1finhlpfam W000005W.
ew1whohelfi1 W000005W.
ew1whohelfi2 W000005W.
ew1atchhelyr W000160W.
ew1fingftfam W000005W.
ew1whregoth1 W000005W.
ew1whregoth2 W000005W.
ew1whregoth3 W000005W.
ew1amthlpgiv W000160W.
ew1progneed1 W000005W.
ew1progneed2 W000005W.
ew1progneed3 W000005W.
ls1evdayact1 W000092W.
ls1evdayact2 W000092W.
ls1evdayact3 W000092W.
ls1evdayact4 W000092W.
ls1evdayact5 W000092W.
ls1evdayact6 W000092W.
ls1evdayact7 W000092W.
ls1evdayact8 W000092W.
ls1ableto1 W000005W.
ls1ableto2 W000005W.
ls1ableto3 W000005W.
ls1ableto4 W000005W.
ls1ableto5 W000005W.
ls1ableto6 W000005W.
ls1ableto7 W000005W.
ls1diskefrm1 W000005W.
ls1diskefrm2 W000005W.
ls1diskefrm3 W000005W.
ls1diskefrm4 W000005W.
ls1diskefrm5 W000005W.
ls1diskefrm6 W000005W.
ls1diskefrm7 W000005W.
ir1spattitud I000006W.
ir1undrstand I000007W.
ir1sppresent I000008W.
ir1intvwhlp I000009W.
ir1prsnhlp1 W000005W.
ir1prsnhlp2 W000005W.
ir1prsnhlp3 W000005W.
ir1prsnhlp4 W000005W.
ir1prsnhlp5 W000005W.
ir1prsnhlp6 W000005W.
ir1prsnhlp91 W000005W.
ir1sessions W000005W.
ir1sessrsn1 I000012W.
ir1sessrsn2 I000012W.
ir1sessrsn3 I000012W.
ir1sessrsn91 I000012W.
ir1conhomapt I000004W.
ir1insidhome I000004W.
ir1condihom1 I000004W.
ir1condihom2 I000004W.
ir1condihom3 I000004W.
ir1condihom4 I000004W.
ir1condihom5 I000004W.
ir1clutterr1 I000013W.
ir1clutterr2 I000013W.
ir1areacond1 I000014W.
ir1areacond2 I000014W.
ir1areacond3 I000014W.
ir1areacond4 I000014W.
ir1condhome1 I000015W.
ir1condhome2 I000015W.
ir1condhome3 I000015W.
ir1condhome4 I000015W.
ir1condhome5 I000015W.
ir1fqphnprsn I000016W.
fq1dfacdescr F000004W.
FQ1DOSFACD DOSFACD.
fq1prtlivnam F000005W.
fq1dfacarea F000006W.
FQ1DOSFACA DOSFACA.
fq1assdnrsng F000007W.
fq1othrlevls F000005W.
fq1whotlevl1 W000005W.
fq1whotlevl2 W000005W.
fq1whotlevl3 W000005W.
fq1whotlevl4 W000005W.
fq1whotlevl5 W000005W.
fq1servaval1 F000009W.
fq1servaval2 F000009W.
fq1servaval3 F000009W.
fq1servaval4 F000009W.
fq1servaval5 F000009W.
fq1servaval6 F000009W.
fq1servaval7 F000009W.
fq1servaval8 F000009W.
fq1servaval9 F000009W.
fq1paysourc1 RFDK_F.
fq1paysourc2 RFDK_F.
fq1paysourc3 RFDK_F.
fq1paysourc4 RFDK_F.
fq1paysourc5 RFDK_F.
fq1paysourc6 RFDK_F.
fq1totalpaym F000005W.
fq1mnthlyamt RFDK_F.
fq1primpayer F000010W.
fq1govsource F000005W.
fq1dlocsp DLOCSP2F.

;
/* Section #4 - Label assignment statement   */
label
spid ="NHATS SAMPLED PERSON ID"
r1dresid ="R1 D RESIDENTIAL CARE STATUS"
r1dresidr ="R1 D RESIDENTL CARE STAT RECODE"
r1breakoffst ="R1 CASE BREAKOFF STATUS"
r1breakoffqt ="R1 CASE BREAKOFF QUESTION"
is1resptype ="R1 IS2 TYPE OF RESPONDENT"
is1reasnprx1 ="R1 IS2A PROXY REAS SP DEMENTIA"
is1reasnprx2 ="R1 IS2A PROXY REAS SP ILL"
is1reasnprx3 ="R1 IS2A PRXY REAS SP SPCH IMPAIR"
is1reasnprx4 ="R1 IS2A PRXY REAS SP HEAR IMPAIR"
is1reasnprx5 ="R1 IS2A PROXY REAS LANG BARRIER"
is1reasnprx6 ="R1 IS2A PROXY REAS TEMP UNAVAIL"
is1reasnprx9 ="R1 IS2A PROXY REAS OTHER"
r1dgender ="R1 D GENDER OF SP"
r1d2intvrage ="R1 D SP CAT AGE AT INTVW"
is1prxyrelat ="R1 IS9 PROXY RELATIONSHIP TO SP"
is1prxygendr ="R1 IS10 PROXY GENDER"
is1famrrutin ="R1 IS11 FAMILRTY SP DAILY ROUTIN"
is1dproxyid ="R1 D PROXY OPID"
re1resistrct ="R1 RE1 RESIDNCE PHYSICAL STRCTUR"
re1bldgfl ="R1 RE2 SP BLDG MORE THAN ONE FLOOR"
re1dcensdiv ="R1 D SP CENSUS DIVISION"
fl1structure ="R1 F RE STRUCTURE OF SP DWELLING"
fl1bldgfl ="R1 F RE SP BLDG MORE THAN ONE FLOOR"
hc1health ="R1 HC1 OVERALL HEALTH CONDITION"
hc1disescn1 ="R1 HC2 SP HAD HEART ATTACK"
hc1disescn2 ="R1 HC2 SP HAS HEART DISEASE"
hc1disescn3 ="R1 HC2 SP HAS HIGH BLOOD PRESS"
hc1disescn4 ="R1 HC2 SP HAS ARTHRITIS"
hc1disescn5 ="R1 HC2 SP HAS OSTEOPOROSIS"
hc1disescn6 ="R1 HC2 SP HAS DIABETES"
hc1disescn7 ="R1 HC2 SP HAS LUNG DISEASE"
hc1disescn8 ="R1 HC2 SP HAD STROKE"
hc1disescn9 ="R1 HC2 SP HAS DEMENTIA OR ALZH"
hc1disescn10 ="R1 HC2 SP HAS CANCER"
hc1cancerty1 ="R1 HC3 SP HAD SKIN CANCER"
hc1dementage ="R1 HC4 AGE TOLD HAD DEMENTIA"
hc1brokebon1 ="R1 HC5A SP BROKEN OR FRACT HIP"
hc1brokebon2 ="R1 HC5B SP OTHR BRKN FRACT BONE"
hc1serdisill ="R1 HC6 SP OTHR SER DIS ILLNES"
hc1hosptstay ="R1 HC7 SP HOSP STAY LAST 12MOS"
hc1hosovrnht ="R1 HC8 SP NUM OF HOSP STAYS"
hc1kneesurg ="R1 HC9A HAD KNEE SURGERY"
hc1knesrgyr ="R1 HC9B KNEE SURGERY IN 12 MNTHS"
hc1ageknesur ="R1 HC9C AGE AT LAST KNEE SURGERY"
hc1hipsurg ="R1 HC10A HIP REPAIR OR REPLACMNT"
hc1hipsrgyr ="R1 HC10B HIP SURG IN 12 MNTHS"
hc1agehipsur ="R1 HC10C AGE AT LAST HIP SURGERY"
hc1catarsurg ="R1 HC11A HAD CATARACT SURGERY"
hc1catrsrgyr ="R1 HC11B CATER SURG IN 12 MNTHS"
hc1agecatsur ="R1 HC11C AGE AT LAST CATRCT SURG"
hc1bckspnsur ="R1 HC12A HAD BACK OR SPINE SURGR"
hc1backsrgyr ="R1 HC12B BCK SPNE SURGR 12 MNTHS"
hc1agebcksrg ="R1 HC12C AGE AT LAST BACK SURGRY"
hc1heartsurg ="R1 HC13A HAD HEART SURGERY"
hc1hartsrgyr ="R1 HC13B HEART SURGERY 12 MONTHS"
hc1agehrtsrg ="R1 HC13C AGE LAST HEART SURGERY"
hc1fllsinmth ="R1 HC14 FALL DOWN IN LAST MONTH"
hc1worryfall ="R1 HC15 WORRIED ABOT FALLNG DOWN"
hc1worrylimt ="R1 HC16 WORRY EVR LIMT ACTIVTIES"
hc1faleninyr ="R1 HC17 FALLEN DOWN IN 12 MONTHS"
hc1multifall ="R1 HC18 FALLEN DWN MORE THN ONCE"
hc1depresan1 ="R1 HC19A SP LITTLE INTERST PLEAS"
hc1depresan2 ="R1 HC19B SP DOWN DEPRES HOPELESS"
hc1depresan3 ="R1 HC19C SP NERVOUS ANXIOUS"
hc1depresan4 ="R1 HC19D SP UNABLE TO STOP WORRY"
hc1aslep30mn ="R1 HC20 OVER 30 MIN FALL ASLEEP"
hc1trbfalbck ="R1 HC21 TROBLE FALLNG BCK ASLEEP"
hc1sleepmed ="R1 HC22 OFTN MEDICATE HELP SLEEP"
ht1longlived ="R1 HT1 HOW LONG LIVED THERE"
ht1mthslived ="R1 HT1A MNTHS IF LESS THAN 1 YR"
ht1yrslived ="R1 HT1B YEARS LIVED AT ADDRESS"
ht1longer5yr ="R1 HT2 LIVED HERE 5 YRS OR LNGER"
ht1placedesc ="R1 HT3 PLACE BEST DESCRIPTION"
ht1retiresen ="R1 HT4 RETIRMNT CMMTY SEN HOUSIN"
ht1diffareun ="R1 HT5 DIFF AREAS UNITS TO MOVE"
ht1helpmedbd ="R1 HT6 HELP W MEDS BATH DRESSING"
ht1meals ="R1 HT7 MEALS FOR RESIDENTS"
ht1spacename ="R1 HT10 NAME OF LIVING SPACE"
fl1facility ="R1 F ROUTING FLAG FROM HT3 5 6 7"
fl1hotype ="R1 F HT TYPE OF HOME"
fl1retirecom ="R1 F HT SP LIVES IN RETIREMT COM"
se1servcoff1 ="R1 SE1 FAC SERVICES MEALS"
se1servcoff2 ="R1 SE1 FAC SERVICES HELP W RX"
se1servcoff3 ="R1 SE1 FAC SERV HELP BATH DRESS"
se1servcoff4 ="R1 SE1 FAC SERVICES LAUNDRY"
se1servcoff5 ="R1 SE1 FAC SERVICES HOUSEKEEP"
se1servcoff6 ="R1 SE1 FAC SERV VAN TO DOCTOR"
se1servcoff7 ="R1 SE1 FAC SRV VAN TO STORE EVNT"
se1servcoff8 ="R1 SE1 FAC SERV RECREATIONAL FAC"
se1servcoff9 ="R1 SE1 FAC SERV SOCIAL EVENTS"
se1servused1 ="R1 SE2 SERVS USED MEALS"
se1servused2 ="R1 SE2 SERVS USED HELP W RX"
se1servused3 ="R1 SE2 SERVS USED HLP BATH DRESS"
se1servused4 ="R1 SE2 SERVS USED LAUNDRY"
se1servused5 ="R1 SE2 SERVS USED HOUSEKEEPING"
se1servused6 ="R1 SE2 SERVS USED VAN TO DOCTOR"
se1servused7 ="R1 SE2 SERVS USED VAN TO STORE"
se1servused8 ="R1 SE2 SERVS USED RECREATION FAC"
se1servused9 ="R1 SE2 SERVS USED SOCIAL EVENTS"
se1payservi1 ="R1 SE3 PAYMENT FOR SERV MEALS"
se1payservi2 ="R1 SE3 PAYMENT FOR SERV HLP W RX"
se1payservi3 ="R1 SE3 PAY FR SERV HLP BATH DRSS"
se1payservi4 ="R1 SE3 PAYMENT FOR SERV LAUNDRY"
se1payservi5 ="R1 SE3 PAYMNT FOR SERV HOUSEKEEP"
se1payservi6 ="R1 SE3 PAYMNT FR SERV VAN TO DOC"
se1payservi7 ="R1 SE3 PAY FOR SERV VAN TO STORE"
se1payservi8 ="R1 SE3 PAY FOR SERV RECREATION"
se1payservi9 ="R1 SE3 PAY FOR SERV SOCIAL EVNTS"
hh1martlstat ="R1 HH1 MARITAL STATUS"
hh1yrendmarr ="R1 HH2B YR MARR END OR SPS PASS"
hh1yrsmarliv ="R1 HH3 YEARS MARR OR LIV TOGTEHR"
hh1spgender ="R1 HH5 GENDER OF SPOUSE"
hh1d2spouage ="R1 D SPOUSE CAT AGE AT INTVW"
hh1spouseduc ="R1 HH9 HIGHEST EDUC OF SPOUSE"
hh1spoupchlp ="R1 HH10 SPOUS NEED PERS CARE HLP"
hh1livwthspo ="R1 HH11 LIVE WITH SPOUSE PARTNER"
hh1placekind ="R1 HH12 KIND OF PLACE LIVE IN"
hh1proxlivsp ="R1 HH13A PROXY LIVES W SP"
hh1othlvhere ="R1 HH13B ANYONE ELSE LIVE HERE"
hh1dspouseid ="R1 D SPOUSE ID"
hh1dlvngarrg ="R1 D LIVING ARRANGEMENT"
hh1dhshldnum ="R1 D TOTAL NUMBER IN HOUSEHOLD"
hh1dhshldchd ="R1 D TOTAL CHILDREN IN HOUSEHOLD"
cs1dreconcil ="R1 D CS1 OP RECORD RECONCILE"
cs1sistrsnum ="R1 CS14 NUMBER OF LIVING SISTERS"
cs1brthrsnum ="R1 CS15 NUMBER OF LIVNG BROTHERS"
cs1dnumchild ="R1 D NUMBER OF CHILDREN"
cs1dnmstpchd ="R1 D NUMBER OF STEP CHILDREN"
cs1dnumdaugh ="R1 D NUMBER OF DAUGHTERS"
cs1dnumson ="R1 D NUMBER OF SONS"
sn1dnumsn ="R1 D NUMBER IN SOCIAL NETWORK"
fl1noonetalk ="R1 F SN SP HAS NO ONE TO TALK TO"
ho1entrstair ="R1 HO1 ENTRANCE STAIRS OUTSIDE"
ho1entrccomn ="R1 HO2 ENTRANCE COMMON OR PRIVAT"
ho1entrnramp ="R1 HO3 RAMP AT ENTRANCE"
ho1bldgamen1 ="R1 HO4A BUILDING HAS ELEVATOR"
ho1bldgamen2 ="R1 HO4B BUILDNG STAIR LIFT GLIDE"
ho1bldgamen3 ="R1 HO4C BUILD COMMN SPACE MEALS"
ho1bldgamen4 ="R1 HO4D BUILD SPACE SOCIAL EVENT"
ho1levelsflr ="R1 HO5 NUMBR OF LEVELS OR FLOORS"
ho1homeamen1 ="R1 H08A BED KITCHN BATH SAME FLR"
ho1homeamen2 ="R1 H08B HOME HAS ELEVATOR"
ho1homeamen3 ="R1 H08C HOME HAS STAIR LFT GLIDE"
ho1bathprivt ="R1 H010 PRIVATE BATH"
ho1bathamen1 ="R1 H011A BATH HAS BATHTUB"
ho1bathamen2 ="R1 H011B BATH HAS SHOWER STALL"
ho1bathamen3 ="R1 H011C BATH GRAB BAR IN SHOWER"
ho1bathamen4 ="R1 H011D BATH SEAT FR SHOWER TUB"
ho1bathamen5 ="R1 H011E BATH RAISED TOILET SEAT"
ho1bathamen6 ="R1 H011F BATH GRAB BARS TOILET"
ho1bathamen7 ="R1 H011G BATH MED EMERGNCY SYSTM"
ho1kitchnprv ="R1 HO12 PRIVATE KITCHEN"
ho1kitchncom ="R1 H013 COMMON KITCHEN"
ho1microwave ="R1 HO14 USE OF MICROWAVE"
fl1onefloor ="R1 F HO SP LIVES ON ONE FLOOR"
fl1bathgrbbr ="R1 F HO SPS BATH HAS GRAB BARS"
fl1bathseat ="R1 F HO SPS BATH HAS SEAT"
fl1raisedtlt ="R1 F HO SP HAS RAISED TOILET"
fl1tltgrbbr ="R1 F HO SP TOILET HAS GRAB BARS"
em1modhere1 ="R1 EM1 ENVIRON MODS HERE OR ADD"
em1addlstyr1 ="R1 EM2A RAMP ADDED IN LAST YR"
em1addlstyr2 ="R1 EM2B ELEVATOR ADDED IN LST YR"
em1addlstyr3 ="R1 EM2C STR LIFT ADDED IN LST YR"
em1addlstyr4 ="R1 EM2D SHWR GRABBAR ADD LST YR"
em1addlstyr5 ="R1 EM2E BATHSEAT ADDED IN LST YR"
em1addlstyr6 ="R1 EM2F TOILETSEAT ADD IN LST YR"
em1addlstyr7 ="R1 EM2G TOILET GRABBARS ADDED YR"
em1payyufam1 ="R1 EM3A SP PAID FOR RAMP"
em1payyufam2 ="R1 EM3B SP PAID FOR ELEVATOR"
em1payyufam3 ="R1 EM3C SP PAID STAIR LFT GLIDE"
em1payyufam4 ="R1 EM3D SP PAID SHOWER GRABBAR"
em1payyufam5 ="R1 EM3E SP PAID SHOWER SEAT"
em1payyufam6 ="R1 EM3F SP PAID RAISD TOILT SEAT"
em1payyufam7 ="R1 EM3G SP PAID TOILET GRABBARS"
em1paydevce1 ="R1 EM4A SP PAID FOR VISION AIDS"
em1paydevce2 ="R1 EM4B SP PAID FOR HEARING AID"
em1paydevce3 ="R1 EM4C SP PAID FOR CANE"
em1paydevce4 ="R1 EM4D SP PAID FOR WALKER"
em1paydevce5 ="R1 EM4E SP PAID FOR WHEELCHAIR"
em1paydevce6 ="R1 EM4F SP PAID FOR SCOOTER"
em1paydevce7 ="R1 EM4G SP PAID FOR GRABBER"
em1paydevce8 ="R1 EM4H SP PD SPECIAL DRESS ITM"
em1paydevce9 ="R1 EM4I SP PAID ADAPTED UTENSILS"
em1payaltgth ="R1 EM5 PAY FOR THESE ALTOGETHER"
em1morls1000 ="R1 EM6 MORE LESS OR ABOUT $1000"
em1morls100 ="R1 EM7 MORE LESS OR ABOUT $100"
cm1knowwell ="R1 CM1 PEOPL KNOW EACH OTHR WELL"
cm1willnghlp ="R1 CM2 PEOPL WILLG HLP EACH OTHR"
cm1peoptrstd ="R1 CM4 PEOPLE CAN BE TRUSTED"
te1cellphone ="R1 TE1 WORKING CELL PHONE"
te1othrphone ="R1 TE3 ONE PHONE OTHER THAN CELL"
te1computer ="R1 TE6 HAS A WORKING COMPUTER"
te1compoth ="R1 TE8 USED COMPUTER ANYWHRE ELS"
te1emailtext ="R1 TE9 EMAIL OR TEXTING"
te1oftnemail ="R1 TE10 EMAIL OR TEXTING OFTEN"
te1online ="R1 TE11 ONLINE COMPUTER USE"
te1shoponli1 ="R1 TE12A INTERNET SHOP GROCERY"
te1shoponli2 ="R1 TE12B INTERNET BANKING"
te1shoponli3 ="R1 TE12C INTERNET ORDR REFLL RX"
te1intrntmd1 ="R1 TE13A INTERNET MEDICAL PROVDR"
te1intrntmd2 ="R1 TE13B INTERNET INSURANCE INFO"
te1intrntmd3 ="R1 TE13C INTERNET HEALTH CONDS"
md1canewlker ="R1 MD1 USED CANE WALKER WHLCHAIR"
md1cane ="R1 MD2 USED A CANE"
md1walker ="R1 MD3 USED A WALKER"
md1wheelchar ="R1 MD4 USED A WHEELCHAIR"
md1whelcrspc ="R1 MD4A WHELCHAIR IN LIVNG SPACE"
md1scooter ="R1 MD5 USE A SCOOTER"
md1scterinsp ="R1 MD5A SCOOTER IN LIVING SPACE"
fl1cane ="R1 F MD SP USES CANE"
fl1walker ="R1 F MD SP USES WALKER"
fl1wheelchr ="R1 F MD SP USES WHEELCHAIR"
fl1whlchrhom ="R1 F MD SP HAS WHEELCHR AT HOME"
fl1scooter ="R1 F MD SP USES SCOOTER"
fl1scooterhm ="R1 F MD SP HAS SCOOTER AT HOME"
ss1heringaid ="R1 SS3 HEARING AID USED"
ss1hearphone ="R1 SS4A SP CAN USE TELEPHONE"
ss1convwradi ="R1 SS4B CONVERSATIN WTH TV RADIO"
ss1convquiet ="R1 SS4C CONVERS IN QUIET ROOM"
ss1glasseswr ="R1 SS7 WEARS GLASSES CONTCTS"
ss1seewellst ="R1 SS8A SEES ACROSS THE STREET"
ss1seestvgls ="R1 SS8B TV ACROSS ROOM W GLASSES"
ss1glasscls ="R1 SS10 WEAR GLS CONTCS SEE CLOS"
ss1othvisaid ="R1 SS11 USED OTHER VISION AIDS"
ss1glrednewp ="R1 SS12 CAN READ NEWSPAPER PRINT"
ss1probchswl ="R1 SS13 PROBLEMS CHEW OR SWALLOW"
ss1probspeak ="R1 SS14 PROBLEMS SPEAKING"
ss1painbothr ="R1 SS15 BOTHERED BY PAIN"
ss1painlimts ="R1 SS17 PAIN EVER LIMTS ACTIVIT"
ss1painmedof ="R1 SS18A LST MNTH OFTEN PAIN MED"
ss1painwhe1 ="R1 SS18B BACK PAIN IN LAST MNTH"
ss1painwhe2 ="R1 SS18B HIP PAIN IN LAST MONTH"
ss1painwhe3 ="R1 SS18B KNEE PAIN IN LAST MNTH"
ss1painwhe4 ="R1 SS18B FOOT PAIN IN LAST MNTH"
ss1painwhe5 ="R1 SS18B HAND PAIN IN LAST MNTH"
ss1painwhe6 ="R1 SS18B WRIST PAIN IN LAST MNTH"
ss1painwhe7 ="R1 SS18B SHOULDR PAIN LST MNTH"
ss1painwhe8 ="R1 SS18B HEAD PAIN IN LAST MNTH"
ss1painwhe9 ="R1 SS18B NECK PAIN IN LAST MNTH"
ss1painwhe10 ="R1 SS18B ARM PAIN IN LAST MNTH"
ss1painwhe11 ="R1 SS18B LEG PAIN IN LAST MNTH"
ss1painwhe12 ="R1 SS18B STOMACH PAIN LAST MNTH"
ss1painwhe13 ="R1 SS18B OTHR SPCFY PAIN LST MO"
ss1probbreat ="R1 SS19 BREATHING PROBLEMS"
ss1prbbrlimt ="R1 SS20 BREATH PROBLS LIMT ACTIV"
ss1strnglmup ="R1 SS21 UPPER BOD STRENGTH LIMIT"
ss1uplimtact ="R1 SS22 UP BOD STRNGTH LIMT ACT"
ss1lwrbodstr ="R1 SS23 LOWER BODY STRNGTH LIMIT"
ss1lwrbodimp ="R1 SS24 LWER BOD STRNGTH IMT ACT"
ss1lowenergy ="R1 SS25 LOW ENERGY IN LAST MONTH"
ss1loenlmtat ="R1 SS26 LOW ENERGY EVER LIM ACT"
ss1prbbalcrd ="R1 SS27 BALANCE OR COORD PROBS"
ss1prbbalcnt ="R1 SS28 BAL COORD PROB LIMIT ACT"
pc1walk6blks ="R1 PC1 ABLE TO WALK 6 BLOCKS"
pc1walk3blks ="R1 PC2 ABLE TO WALK 3 BLOCKS"
pc1up20stair ="R1 PC3 ABLE TO WALK UP 20 STAIRS"
pc1up10stair ="R1 PC4 ABLE TO WALK UP 10 STAIRS"
pc1car20pnds ="R1 PC5 ABLE TO CARRY 20 POUNDS"
pc1car10pnds ="R1 PC6 ABLE TO CARRY 10 POUNDS"
pc1geonknees ="R1 PC7 ABLE TO GET DOWN ON KNEES"
pc1bendover ="R1 PC8 ABLE TO BEND OVER"
pc1hvobovrhd ="R1 PC9 HEAVY OBJECT ABOVE HEAD"
pc1rechovrhd ="R1 PC10 ABLE TO REACH OVERHEAD"
pc1opnjarwhd ="R1 PC11 OPEN SEALED JAR W HANDS"
pc1grspsmobj ="R1 PC12 ABLE GRASP SMALL OBJECTS"
cp1memrygood ="R1 CP1 HOW GOOD MEMRY AT PRESNT"
cp1knownspyr ="R1 CP2 KNOWN SP 4 AT LEAST A YR"
cp1chgthink1 ="R1 CP3A SP DIFF REMEMBER DATE"
cp1chgthink2 ="R1 CP3B SP REPEATS SELF"
cp1chgthink3 ="R1 CP3C SP DIFF REMEMBER APPT"
cp1chgthink4 ="R1 CP3D SP CHNG INTRST ACT HOB"
cp1chgthink5 ="R1 CP3E SP DIFF WITH MONEY MGMT"
cp1chgthink6 ="R1 CP3F SP DIFF LEARNG USE TOOL"
cp1chgthink7 ="R1 CP3G SP PRBLMS WITH JDGMNT"
cp1chgthink8 ="R1 CP3H SP DLY PRBLMS W THNK MEM"
cp1memcogpr1 ="R1 CP4A LOST IN FAMILIAR ENVIRON"
cp1memcogpr2 ="R1 CP4B SP WANDERD OFF NO RETRN"
cp1memcogpr3 ="R1 CP4C SP ABLE LEFT ALONE 1 HR"
cp1memcogpr4 ="R1 CP4D SP HEARS SEES THNGS"
cg1speaktosp ="R1 CG1A MAY SPEAK TO SP ASK QUES"
cg1quesremem ="R1 CG1C START W QUES ABOUT MEMRY"
cg1reascano1 ="R1 CG1D SP CANT ANS DEMENTIA"
cg1reascano2 ="R1 CG1D SP CANT ANS UNABLE SPEAK"
cg1reascano3 ="R1 CG1D SP CANT ANS UNABLE HEAR"
cg1reascano4 ="R1 CG1D SP CANT ANS SP REFUSED"
cg1reascano5 ="R1 CG1D SP CANT ANS PROXY REFUSD"
cg1reascano6 ="R1 CG1D SP CANT ANS NOT PRESENT"
cg1reascano7 ="R1 CG1D SP CANT ANS SP TOO ILL"
cg1reascano8 ="R1 CG1D SP CANT ANS LANG BARRIER"
cg1reascano9 ="R1 CG1D SP CANT ANS OTHR SPECIFY"
cg1ratememry ="R1 CG2 RATE YOUR MEMORY"
cg1ofmemprob ="R1 CG3 OFTN MEMRY PROBS INTERFER"
cg1memcom1yr ="R1 CG4 MEMRY COMPARD TO 1 YR AGO"
cg1todaydat1 ="R1 CG6A TODAY'S DATE CORRCT MNTH"
cg1todaydat2 ="R1 CG6B TODAY'S DATE CORRECT DAY"
cg1todaydat3 ="R1 CG6C TODAY'S DATE CORRECT YR"
cg1todaydat4 ="R1 CG6D TODAY'S DATE CORRCT DOW"
cg1todaydat5 ="R1 CG6E TODAY'S DATE SP USED AID"
cg1prewrdrcl ="R1 CG7PRE INTRO TO WORD RECALL"
cg1dwrdlstnm ="R1 D WHCH WORD LIST WAS ASSIGNED"
cg1wrdsrcal1 ="R1 CG8 1 TELL WORDS U CAN RECALL"
cg1wrdsrcal2 ="R1 CG8 2 TELL WORDS U CAN RECALL"
cg1wrdsrcal3 ="R1 CG8 3 TELL WORDS U CAN RECALL"
cg1wrdsrcal4 ="R1 CG8 4 TELL WORDS U CAN RECALL"
cg1wrdsrcal5 ="R1 CG8 5 TELL WORDS U CAN RECALL"
cg1wrdsrcal6 ="R1 CG8 6 TELL WORDS U CAN RECALL"
cg1wrdsrcal7 ="R1 CG8 7 TELL WORDS U CAN RECALL"
cg1wrdsrcal8 ="R1 CG8 8 TELL WORDS U CAN RECALL"
cg1wrdsrcal9 ="R1 CG8 9 TELL WORDS U CAN RECALL"
cg1wrdsrca10 ="R1 CG8 10 TELLWORDS U CAN RECALL"
cg1dwrdimmrc ="R1 D SCORE IMMEDIATE WORD RECALL"
cg1dwrdinone ="R1 D IMMEDIATE RECALL NONE"
cg1dwrdirref ="R1 D IMMEDIATE RECALL REFUSED"
cg1wrdsntlst ="R1 CG8A WORDS NOT ON LIST"
cg1numnotlst ="R1 CG8B NUM WORDS NOT ON LIST"
cg1probreca1 ="R1 CG9 SP HAD DIFF HEARING WORDS"
cg1probreca2 ="R1 CG9 INTERRUPTION AS LIST READ"
cg1probreca3 ="R1 CG9 PROB WORD RECALL SPECIFY"
cg1probreca4 ="R1 CG9 WD RECALL NO PROB OCCURRD"
cg1dclkdraw ="R1 D SCORE OF CLOCK DRAWING TEST"
cg1dclkimgcl ="R1 D IMAGE CLARITY CLOCK DRAWING"
cg1atdrwclck ="R1 CG10A SP ATTEMPT CLOCK DRAWIG"
cg1presidna1 ="R1 CG13A PRES LAST NAME CORRECT"
cg1presidna2 ="R1 CG13B PRES LAST NAME INCORRCT"
cg1presidna3 ="R1 CG13C PRES FIRST NAME CORRCT"
cg1presidna4 ="R1 CG13D PRES FIRST NAME INCORR"
cg1vpname1 ="R1 CG14A VP LAST NAME CORRECT"
cg1vpname2 ="R1 CG14B VP LAST NAME INCORRECT"
cg1vpname3 ="R1 CG14C VP FIRST NAME CORRECT"
cg1vpname4 ="R1 CG14D VP FIRST NAME INCORRECT"
cg1wrdsdcal1 ="R1 CG15 1 DELAYED WORD RECALL"
cg1wrdsdcal2 ="R1 CG15 2 DELAYED WORD RECALL"
cg1wrdsdcal3 ="R1 CG15 3 DELAYED WORD RECALL"
cg1wrdsdcal4 ="R1 CG15 4 DELAYED WORD RECALL"
cg1wrdsdcal5 ="R1 CG15 5 DELAYED WORD RECALL"
cg1wrdsdcal6 ="R1 CG15 6 DELAYED WORD RECALL"
cg1wrdsdcal7 ="R1 CG15 7 DELAYED WORD RECALL"
cg1wrdsdcal8 ="R1 CG15 8 DELAYED WORD RECALL"
cg1wrdsdcal9 ="R1 CG15 9 DELAYED WORD RECALL"
cg1wrdsdca10 ="R1 CG15 10 DELAYED WORD RECALL"
cg1dwrddlyrc ="R1 D SCORE DELAYED WORD RECALL"
cg1dwrddnone ="R1 D DELAYED RECALL NONE"
cg1dwrddrref ="R1 D DELAYED RECALL REFUSED"
cg1wrdnotlst ="R1 CG16 WORDS NOT ON LIST"
cg1numwrdnot ="R1 CG17 NUM OF WORDS NOT ON LIST"
cg1dwrd1rcl ="R1 D WORD1 IMMEDIATE RECALL"
cg1dwrd2rcl ="R1 D WORD2 IMMEDIATE RECALL"
cg1dwrd3rcl ="R1 D WORD3 IMMEDIATE RECALL"
cg1dwrd4rcl ="R1 D WORD4 IMMEDIATE RECALL"
cg1dwrd5rcl ="R1 D WORD5 IMMEDIATE RECALL"
cg1dwrd6rcl ="R1 D WORD6 IMMEDIATE RECALL"
cg1dwrd7rcl ="R1 D WORD7 IMMEDIATE RECALL"
cg1dwrd8rcl ="R1 D WORD8 IMMEDIATE RECALL"
cg1dwrd9rcl ="R1 D WORD9 IMMEDIATE RECALL"
cg1dwrd10rcl ="R1 D WORD10 IMMEDIATE RECALL"
cg1dwrd1dly ="R1 D WORD1 DELAYED RECALL"
cg1dwrd2dly ="R1 D WORD2 DELAYED RECALL"
cg1dwrd3dly ="R1 D WORD3 DELAYED RECALL"
cg1dwrd4dly ="R1 D WORD4 DELAYED RECALL"
cg1dwrd5dly ="R1 D WORD5 DELAYED RECALL"
cg1dwrd6dly ="R1 D WORD6 DELAYED RECALL"
cg1dwrd7dly ="R1 D WORD7 DELAYED RECALL"
cg1dwrd8dly ="R1 D WORD8 DELAYED RECALL"
cg1dwrd9dly ="R1 D WORD9 DELAYED RECALL"
cg1dwrd10dly ="R1 D WORD10 DELAYED RECALL"
mo1outoft ="R1 MO1 OFTEN GO OUTSIDE"
mo1outcane ="R1 MO2 CANE USED OUTSIDE"
mo1outwalkr ="R1 MO3 WALKER USED OUTSIDE"
mo1outwlchr ="R1 MO4 WHEELCHAIR USED OUTSIDE"
mo1outsctr ="R1 MO5 SCOOTER USED OUTSIDE"
mo1outhlp ="R1 MO6 HELP GO OUTSIDE"
mo1outslf ="R1 MO7 LEFT BY YOURSELF"
mo1outdif ="R1 MO8 HOW DIFFICULT"
mo1outyrgo ="R1 MO9 HOW OFTEN LEAVE"
mo1outwout ="R1 MO10 STAYED IN NO HELP"
mo1oftgoarea ="R1 MO11 HOW OFTEN GO OTHER AREAS"
mo1oflvslepr ="R1 MO12 HOW OFTN LEAVE BEDROOM"
mo1insdcane ="R1 MO13 OFTEN USED CANE INSIDE"
mo1insdwalkr ="R1 MO14 OFTEN USED WALKER INSIDE"
mo1insdwlchr ="R1 MO15 OFT USD WHEELCHAR INSIDE"
mo1insdsctr ="R1 MO16 OFTEN USD SCOOTER INSIDE"
mo1oftholdwl ="R1 MO17 OFTEN HOLD WALLS INSIDE"
mo1insdhlp ="R1 MO18 GOT HELP INSIDE"
mo1insdslf ="R1 MO20 HOW OFTEN BY YOURSELF"
mo1insddif ="R1 MO21 HOW DIFF GET ARD W DEVCE"
mo1insdyrgo ="R1 MO22 HOW OFTEN COMPRED YR AGO"
mo1insdwout ="R1 MO23 PLACES INSIDE DID NOT GO"
mo1beddev ="R1 MO24 OUT OF BED USED DEVICE"
mo1bedhlp ="R1 MO25 GOT HELP OUT OF BED"
mo1bedslf ="R1 MO26 OFT GOT OUT BED BY SLF"
mo1beddif ="R1 MO27 DIFF GET OUT BED BY SELF"
mo1bedwout ="R1 MO28 OFTEN HAD TO STAY IN BED"
mo1doutsfdf ="R1 D GO OUTSIDE SELF"
mo1doutdevi ="R1 D GO OUTSIDE USING DEVICES"
mo1douthelp ="R1 D GO OUTSIDE USING HELP"
mo1dinsdsfdf ="R1 D MOVE INSIDE SELF"
mo1dinsddevi ="R1 D MOVE INSIDE WITH DEVICES"
mo1dinsdhelp ="R1 D MOVE INSIDE WITH HELP"
mo1dbedsfdf ="R1 D GET OUT OF BED"
mo1dbeddevi ="R1 D DEVICE USE 2 GET OUT OF BED"
mo1dbedhelp ="R1 D HELP TO GET OUT OF BED"
fl1didntleav ="R1 F MO SP DID NOT LEAVE HOME"
fl1ntlvrmslp ="R1 F MO SP DID NOT LEAVE BEDROOM"
dm1helpmobil ="R1 DM1 GET HELP WITH MOBILITY"
dm1helpyrmor ="R1 DM2 GETTING HELP YR OR MORE"
dm1yrsgethlp ="R1 DM3A HOW MANY YRS GETTNG HELP"
dm1mthgethlp ="R1 DM3B MNTH FIRST LAST GET HLP"
dm1lstyrcane ="R1 DM4 IN LST YR USE CANE WALKER"
dm1caneforyr ="R1 DM5 USD CANE, ETC. YR OR MORE"
dm1yrsuscane ="R1 DM6A YEARS USING A CANE, ETC"
dm1mtfrtcane ="R1 DM6B MTH FST LST USE CANE ETC"
dm1mobhelp65 ="R1 DM7 GETTIG HLP W MOBIL AGE 65"
dm1snc65mohl ="R1 DM8 SINCE 65 EV GET HLP W MOB"
dm1at65uscan ="R1 DM9 USE CANE, ETC WHEN TRN 65"
dm1snc65uscn ="R1 DM10 SINCE TURNED 65 USD CANE"
dm1dhlpyr ="R1 D ANY MOBILITY HELP LAST YEAR"
dm1dhlpst ="R1 D MTHS MOBILITY HELP STARTED"
dm1dhlpend ="R1 D MONTHS MOBILITY HELP ENDED"
dm1dhlpyrs ="R1 D YEARS OF MOBILITY HELP"
dm1ddeviyr ="R1 D MOB DEVICE USE LAST YR"
dm1ddevist ="R1 D MTHS DEVICE USE SINCE START"
dm1ddeviend ="R1 D MONTHS DEVICE USE SINCE END"
dm1ddeviyrs ="R1 D YEARS OF DEVICE USE"
dt1oftedrive ="R1 DT1 HOW OFTEN DRIVE PLACES"
dt1lastdrove ="R1 DT2 WHEN LAST TIME YOU DROVE"
dt1mthltdrov ="R1 DT2A1 MONTH LAST DROVE"
dt1yrlstdrov ="R1 DT2A2 YEAR LAST DROVE"
dt1mthagodrv ="R1 DT2B MONTHS AGO LAST DROVE"
dt1yragoldrv ="R1 DT2C HOW MNY YRS AGO LST DROV"
dt1ageltdrov ="R1 DT2D AGE WHEN LAST DROVE"
dt1avoidriv1 ="R1 DT3A AVOID DRIVING AT NIGHT"
dt1avoidriv2 ="R1 DT3B AVOID DRIVING ALONE"
dt1avoidriv3 ="R1 DT3C AVOID DRIVING HIGHWAYS"
dt1avoidriv4 ="R1 DT3D AVOID DRIVING BAD WEATHR"
dt1getoplcs1 ="R1 DT4A SP WALKED GOT PLACES"
dt1getoplcs2 ="R1 DT4B GOT RIDE FAM FRIEND PD"
dt1getoplcs3 ="R1 DT4C VANSHUTTLE PROV BY PLACE"
dt1getoplcs4 ="R1 DT4D VAN SHUTTLE FOR SENIORS"
dt1getoplcs5 ="R1 DT4E SP TOOK PUBLIC TRANSPRT"
dt1getoplcs6 ="R1 DT4F SP TOOK TAXI GOT PLACES"
dt1getoplcs7 ="R1 DT4G GOT PLACES OTHR SPECIFY"
dt1otfrfamtk ="R1 DT6 ANTH FND FAM MEM TOOK YOU"
fl1drives ="R1 F DT SP DRIVES CAR"
fl1drvlstyr ="R1 F DT SP DROVE CAR IN PAST YR"
ha1laun ="R1 HA1 HOW LAUNDRY GOT DONE"
ha1launslf ="R1 HA1A DO LAUNDRY YOURSELF"
ha1whrmachi1 ="R1 HA2 WASH MACHINE IN HOME"
ha1whrmachi2 ="R1 HA2 WASH MACHIN IN BUILDING"
ha1whrmachi3 ="R1 HA2 WASH MACHIN LAUNDROMAT"
ha1whrmachi4 ="R1 HA2 WASH MACHIN SINK IN HOME"
ha1whrmachi5 ="R1 HA2 WASH MACH SINK IN BUILDNG"
ha1whrmachi6 ="R1 HA2 WASH MACHIN OTHR SPECIFY"
ha1dlaunreas ="R1 D LAUNDRY REASN WITH BY OTHERS"
ha1laundif ="R1 HA5 DIFF DOING LAUNDY BY SELF"
ha1launoft ="R1 HA6 HOW OFTEN DO LAUNDRY"
ha1launwout ="R1 HA7 EVER GO WOUT CLEAN LAUNDR"
ha1shop ="R1 HA20 HOW YOUR SHOPPING DONE"
ha1shopslf ="R1 HA20A EVER SHOP BY YOURSELF"
ha1howpaygr1 ="R1 HA22 PAY GROC PERS ITMS CASH"
ha1howpaygr2 ="R1 HA22 PAY GROC PERS ITMS CHCK"
ha1howpaygr3 ="R1 HA22 PAY GROC PERS ITMS DEBIT"
ha1howpaygr4 ="R1 HA22 PAY GROC PERS CREDIT"
ha1howpaygr5 ="R1 HA22 PAY GROC PERS FOOD STMP"
ha1howpaygr6 ="R1 HA22 PAY GROC PERS SMON ELS"
ha1howpaygr7 ="R1 HA22 PAY GROC PERS OTHR SPEC"
ha1howgtstr1 ="R1 HA23 DROVE TO THE STORE"
ha1howgtstr2 ="R1 HA23 FAM FRND PD HLP DROVE"
ha1howgtstr3 ="R1 HA23 VAN PLACE SP LIVES DROVE"
ha1howgtstr4 ="R1 HA23 VAN 4 DIS SENIORS DROVE"
ha1howgtstr5 ="R1 HA23 PUBLIC TRANSPORT 2 STORE"
ha1howgtstr6 ="R1 HA23 SP TOOK TAXI 2 THE STORE"
ha1howgtstr7 ="R1 HA23 SP WALKED TO THE STORE"
ha1howgtstr8 ="R1 HA23 OTHR SPECIFY TO STORE"
ha1shopcart ="R1 HA24A EVER USE MOTORIZED CART"
ha1shoplean ="R1 HA24B EVER LEAN ON SHOP CART"
ha1dshopreas ="R1 D SHOP REASN WITH BY OTHERS"
ha1shopdif ="R1 HA27 DIFF SHOPPING BY SELF"
ha1shopoft ="R1 HA28 HOW OFT SHOP GROCERIES"
ha1shopwout ="R1 HA29 EVER GO WITHOUT GROCRIES"
ha1meal ="R1 HA30 HOW HOT MEALS GET MADE"
ha1mealslf ="R1 HA30A MAKE HOT MEALS YOURSELF"
ha1restamels ="R1 HA30B OFTN HAV RESTARNT MEALS"
ha1oftmicrow ="R1 HA31 OFTEN USE THE MICROWAVE"
ha1dmealreas ="R1 D MEALS REASN WITH BY OTHERS"
ha1mealdif ="R1 HA34 DIFICULTY MAK MEALS SELF"
ha1mealoft ="R1 HA35 HOW OFTEN MAKE HOT MEALS"
ha1mealwout ="R1 HA36 EVER GO WITHOUT HOT MEAL"
ha1bank ="R1 HA40 HOW BILLS BANKIN HANDLED"
ha1bankslf ="R1 HA40A HNDL BILLS BNKING YRSLF"
ha1dbankreas ="R1 D BANK BILL REASN WITH BY OTH"
ha1bankdif ="R1 HA44 DIF HNDL BLLS BNKING SLF"
ha1bankoft ="R1 HA45 HOW OFTEN YOU PAY BILLS"
ha1bankwout ="R1 HA46 EVER GO WOUT PAYIN BILLS"
ha1money ="R1 HA50 MONEY MATTERS TO HANDLE"
ha1moneyhlp ="R1 HA51 ANYONE HLP W MONY MATTRS"
ha1dlaunsfdf ="R1 D LAUNDRY SELF AND DIFF LEVEL"
ha1dshopsfdf ="R1 D SLF SHOPPING AND DIFF LEVEL"
ha1dmealsfdf ="R1 D SELF MEALS AND DIFF LEVEL"
ha1dbanksfdf ="R1 D SELF BANKS AND DIFF LEVEL"
ha1dmealwhl ="R1 D HELPER IS MEALS ON WHEELS"
ha1dmealtkot ="R1 D HELPER IS RESTAURNT TAKEOUT"
sc1eatdev ="R1 SC1 EVER USE ADAPTED UTENSILS"
sc1eatdevoft ="R1 SC2 OFTEN USE ADAPTED UTENSLS"
sc1eathlp ="R1 SC3 DID ANYONE HELP YOU EAT"
sc1eatslfoft ="R1 SC4 HOW OFTEN EAT BY YOURSELF"
sc1eatslfdif ="R1 SC5 DIFFICULTY EATING BY SELF"
sc1eatwout ="R1 SC6 GO WOUT EAT BECSE NO HELP"
sc1showrbat1 ="R1 SC7 SP SHOWERED"
sc1showrbat2 ="R1 SC7 SP TOOK BATHS IN A TUB"
sc1showrbat3 ="R1 SC7 SP WASHED SOME OTHR WAY"
sc1prfrshbth ="R1 SC8 PREFER SHOWR BATH OR OTHR"
sc1scusgrbrs ="R1 SC9 HOW OFTEN USE GRAB BARS"
sc1shtubseat ="R1 SC10 OFTN USE SHOWR TUB SEAT"
sc1bathhlp ="R1 SC11 ANYN HLP SHOWR BATH OTHR"
sc1bathoft ="R1 SC12 HOW OFTEN BATHE YOURSELF"
sc1bathdif ="R1 SC13 DIFF USING BARS OR SEATS"
sc1bathyrgo ="R1 SC14 BATHE MRE OFT THN YR AGO"
sc1bathwout ="R1 SC15 EVER GO WITHOUT WASHING"
sc1usvartoi1 ="R1 SC16 SP USED PORTABLE COMMODE"
sc1usvartoi2 ="R1 SC16 SP USED PADS UNDERGMT"
sc1usvartoi3 ="R1 SC16 USED GRABBARS FR TOILET"
sc1usvartoi4 ="R1 SC16 USED RAISED TOILET SEAT"
sc1toilhlp ="R1 SC17 ANYON HLP YOU USE TOILET"
sc1toiloft ="R1 SC18 OFTEN USE TOILET BY SELF"
sc1toildif ="R1 SC19 DIFFICUTY TOILETING SELF"
sc1toilwout ="R1 SC20 ACCIDENT WET SOIL CLTHES"
sc1dresoft ="R1 SC21 OFTEN YOU GET DRESSED"
sc1dresdev ="R1 SC22 USE SPECL ITEMS TO DRESS"
sc1dreshlp ="R1 SC23 ANYONE HELP GET DRESSED"
sc1dresslf ="R1 SC24 OFTEN YOU DRESS YOURSELF"
sc1dresdif ="R1 SC25 DIF WHN US SP ITMS YRSLF"
sc1dresyrgo ="R1 SC26 HOW OFTN YOU GET DRESSED"
sc1dreswout ="R1 SC27 GO WITHOUT GTTNG DRESSED"
sc1deatdevi ="R1 D USES DEVICES WHILE EATING"
sc1deathelp ="R1 D HAS HELP EATING"
sc1deatsfdf ="R1 D DIFF EATING BY SELF WO HELP"
sc1dbathdevi ="R1 D USES DEVICES WHILE BATHING"
sc1dbathhelp ="R1 D HAS HELP WHILE BATHING"
sc1dbathsfdf ="R1 D DIFF BATHING SELF NO HELP"
sc1dtoildevi ="R1 D USES DEVICE WHILE TOILETING"
sc1dtoilhelp ="R1 D HAS HELP WHILE TOILETING"
sc1dtoilsfdf ="R1 D DIFF LEVEL TOILETING SELF"
sc1ddresdevi ="R1 D USES DEVICES WHILE DRESSING"
sc1ddreshelp ="R1 D HAS HELP WHILE DRESSING"
sc1ddressfdf ="R1 D DIFF LEVEL DRESSING SELF"
fl1showering ="R1 F SC SP USES SHOWER"
fl1takingbth ="R1 F SC SP TAKES BATHS"
fl1washingup ="R1 F SC SP WASHES OTHER WAY"
ds1gethlpeat ="R1 DS1 GET HELP WITH EATING, ETC"
ds1hlpmrtnyr ="R1 DS2 GET HELP FOR YEAR OR MORE"
ds1yrsgethlp ="R1 DS3A HOW MANY YRS GETTING HLP"
ds1mthgethlp ="R1 DS3B MNTH FIRST/LAST GET HELP"
ds1gthptrn65 ="R1 DS4 GET HLP ARND TIME TRND 65"
ds1gthpsin65 ="R1 DS5 GETTING HLP SNCE TRNED 65"
ds1dhlpyr ="R1 D ANY SELF CARE HELP LAST YEAR"
ds1dhlpst ="R1 D MTHS SINCE SLF CARE HELP ST"
ds1dhlpend ="R1 D MTHS SINCE SLF CARE HLP END"
ds1dhlpyrs ="R1 D YEARS HELP IN CARING 4 SELF"
mc1meds ="R1 MC1 IN MNTH TKE MEDS PRESCRBD"
mc1medstrk ="R1 MC2 KEEP TRCK PRESCRIED MEDS"
mc1medsslf ="R1 MC2A LAST MNTH KEEP TRACK SLF"
mc1whrgtmed1 ="R1 MC3 SP GOT MEDS LOCAL STORE"
mc1whrgtmed2 ="R1 MC3 SP GOT MEDS BY MAIL"
mc1whrgtmed3 ="R1 MC3 SP GOT MEDS HC PRVDR HSP"
mc1whrgtmed4 ="R1 MC3 SP GOT MEDS OTHR SPECIFY"
mc1howpkupm1 ="R1 MC3B SP PICKD UP MEDS BY SELF"
mc1howpkupm2 ="R1 MC3B SP HAD MEDS DELIVERED"
mc1howpkupm3 ="R1 MC3B SMEON ELSE PICKD UP MEDS"
mc1medsrem ="R1 MC4 USE REMNDERS TO KEEP TRCK"
mc1dmedsreas ="R1 D MEDS REASN BY WITH OTHERS"
mc1medsdif ="R1 MC7 HOW DIFFIC KEEP TRACK MED"
mc1medsyrgo ="R1 MC8 COMPAR YR AGO HW KEP TRCK"
mc1medsmis ="R1 MC9 MAKE MISTAKE TAKING MEDS"
mc1havregdoc ="R1 MC10 YOU HAVE REGULAR DOCTOR"
mc1regdoclyr ="R1 MC12 SEEN REG DOC WTHN LST YR"
mc1hwgtregd1 ="R1 MC15 SP DROVE SELF TO REG DOC"
mc1hwgtregd2 ="R1 MC15 FAM PD HLP DRVE REG DOC"
mc1hwgtregd3 ="R1 MC15 VAN PLCE SP LIVE REG DOC"
mc1hwgtregd4 ="R1 MC15 VAN FR DIS SENIOR REG DC"
mc1hwgtregd5 ="R1 MC15 PUBLIC TRANSPORT REG DOC"
mc1hwgtregd6 ="R1 MC15 SP TOOK TAXI TO REG DOC"
mc1hwgtregd7 ="R1 MC15 SP WALKED TO REG DOC"
mc1hwgtregd8 ="R1 MC15 REG DOC WAS HOME VISIT"
mc1hwgtregd9 ="R1 MC15 OTHR SPECIFY REG DOC"
mc1ansitindr ="R1 MC16 ANONE SIT IN W YOU AT DR"
mc1tpersevr1 ="R1 MC19 HLP UPTO EXAM TBL DRESS"
mc1tpersevr2 ="R1 MC19 REMND SP OF QSTNS FR DOC"
mc1tpersevr3 ="R1 MC19 ASK TELL DOC THINGS 4 SP"
mc1tpersevr4 ="R1 MC19 HLP SP UNDERSTAND DOC"
mc1chginspln ="R1 MC20 CHGD ADD INS OR DRUG PLN"
mc1anhlpwdec ="R1 MC21 ANYONE HELP W DECISION"
mc1dmedssfdf ="R1 D DIFF LEVEL MEDICATIONS SELF"
pa1vistfrfam ="R1 PA1 EVER VISIT FRIENDS FAMILY"
pa1hlkepfvst ="R1 PA2 HLTH KP FR VIST FAM FRNDS"
pa1trkpfrvis ="R1 PA3 TRAN PRB KP FR VST FRNDS"
pa1impvstfam ="R1 PA4 IMPRTNT VISIT FRNDS FAMLY"
pa1attrelser ="R1 PA5 EVER ATTEND RELIG SERVCES"
pa1htkfrrlsr ="R1 PA6 HEALTH KEEP FRM RELI SERV"
pa1trprrelsr ="R1 PA7 TRAN PRO KEEP FM RELG SER"
pa1imprelser ="R1 PA8 HW IMPORT ARE RELIG SERVS"
pa1clbmtgrac ="R1 PA9 CLUB MEETINGS GRP ACTIVES"
pa1hlkpfrclb ="R1 PA10 HELTH KEP FRM CLB MTINGS"
pa1trprkpfgr ="R1 PA11 TRANS PROB KEEP FM GROPS"
pa1imparclub ="R1 PA12 IMPORT PARTIC CLUBS GRUP"
pa1outfrenjy ="R1 PA13 EVER GO OUT FOR ENJOYMNT"
pa1hlkpgoenj ="R1 PA14 HLTH KP GO OUT FOR ENJOY"
pa1trprgoout ="R1 PA15 TRANSPROB KEEP FM GO OUT"
pa1impouteny ="R1 PA16 IMPORT GO OUT FOR ENJOYT"
pa1workfrpay ="R1 PA17 EVER WORK FOR PAY"
pa1hlkpfrwrk ="R1 PA18 HEALTH KEEP YOU FRM WORK"
pa1voltrwork ="R1 PA19 EVER DO VOLUNTEER WORK"
pa1hlkpfrvol ="R1 PA20 HELTH KEEP FM VOLUNTRING"
pa1prcranoth ="R1 PA21 PROVIDE CARE ANTHER PERS"
pa1evrgowalk ="R1 PA23 EVER GO WALKING"
pa1vigoractv ="R1 PA24 EVER VIGOROUS ACTIVITIES"
pa1helmfvact ="R1 PA26 HEALTH LIMIT FAV ACTIVTY"
pa1dfavact ="R1 D FAVORITE ACTIVITY"
sd1smokedreg ="R1 SD1 SMOKED REGULARLY"
sd1smokesnow ="R1 SD2 SMOKES NOW"
sd1numcigday ="R1 SD3 NUM OF CIGARETTES PER DAY"
sd1agesrtsmk ="R1 SD4 AGE STARTED SMOKING"
sd1agelstsmk ="R1 SD5 AGE LAST SMOKED REGULARLY"
pe1whhndsign ="R1 PE1 HAND USE TO SIGN YOR NAME"
pe1surghdwrt ="R1 PE2 HAVE SURGRY TO HAND WRIST"
pe1surgyside ="R1 PE3 WHICH SIDE WAS SURGERY"
pe1flruppain ="R1 PE4 EXPER FLARE UP PAIN HAND"
pe1sideflrup ="R1 PE5 SIDE CURRNT FLARE UP PAIN"
pe1surgarmsh ="R1 PE6 SURGERY ARM OR SHOULDER"
pe1sidsurgar ="R1 PE7 SIDE SURGERY ARM OR SHLDR"
pe1surgyhips ="R1 PE8 SURG HIPS INCLUD REPLCMNT"
pe1sidhipsrg ="R1 PE9 SIDE WAS HIP SURGERY ON"
pe1stndwhold ="R1 PE11 STAND WITHOUT HOLDING ON"
pe1upchbyslf ="R1 PE12 GET UP OUT CHAIR BY SELF"
pe1wlkdsself ="R1 PE13 WALK SHORT DIST BY SELF"
fl1lefthand ="R1 F PE CAN SP DO LEFT HAND TEST"
fl1righthand ="R1 F PE CAN SP DO RGT HAND TEST"
fl1eiherhand ="R1 F PE CAN SP DO EITHR HAND TST"
fl1lftgrptst ="R1 F PE CAN SP DO LFT GRIP TEST"
fl1rhtgrptst ="R1 F PE CAN SP DO RIGHT GRIP TST"
fl1charstnds ="R1 F PE CAN SP DO CHAIR STANDS"
fl1balstands ="R1 F PE CAN SP DO BALANCE STANDS"
fl1wlkingrse ="R1 F PE CAN SP DO WALKING COURSE"
ba1dblssadm ="R1 D BALANCE SIDE BY SIDE ADMIN"
ba1dblstadm ="R1 D BALANCE SEMI TANDEM ADMIN"
ba1dblftadm ="R1 D BALANCE FULL TANDEM ADMIN"
ba1dblopadm ="R1 D BALANCE 1 LEG OP EYE ADMIN"
ba1dblcladm ="R1 D BALANCE 1 LEG CLS EYE ADMIN"
wa1dwlkadm ="R1 D WALKING COURSE ADMIN"
ch1dschradm ="R1 D SINGLE CHAIR ADMIN"
ch1drchradm ="R1 D REPEAT CHAIR ADMIN"
gr1dgripadm ="R1 D GRIP STRENGTH ADMIN"
wc1dwaistadm ="R1 D WAIST CIRCUMFERENCE ADMIN"
pk1dpeakadm ="R1 D PEAK AIR FLOW ADMIN"
ab1datemonth ="R1 AB COVER DATE MONTH"
ab1dateyear ="R1 AB COVER DATE YEAR"
in1strtabhrs ="R1 IN8 START TIME HOURS"
in1strtabmin ="R1 IN8 START TIME MINUTES"
in1strtmampm ="R1 IN8 START TIME AM OR PM"
ba1sxsresult ="R1 BA3 SIDE BY SIDE STAND RESULT"
ba1blstdsecs ="R1 BA4A SECS SIDE BY SIDE STAND"
ba1blstdhndr ="R1 BA4B HNRDS SIDE BY SIDE STND"
ba1rsn1ssstd ="R1 BA5 1 NO STAND SP FELT UNSAFE"
ba1rsn2ssstd ="R1 BA5 2 NO STAND PRXY FELT UNSF"
ba1rsn3ssstd ="R1 BA5 3 NO STND INTWR FELT UNSF"
ba1rsn4ssstd ="R1 BA5 4NO STND SP UNABL2UNDRSTD"
ba1rsn9ssstd ="R1 BA5 9 NO STAND OTHER SPECIFY"
ba1stdmreslt ="R1 BA7 SEMI TANDEM STAND RESULT"
ba1stdmsecs ="R1 BA8A SECS HELD SEMI TANDM STD"
ba1stdmhndr ="R1 BA8B HNRDS HLD SEMI TANDM STD"
ba1rsn1ststd ="R1 BA9 1 NO STNDM SP FELT UNSAFE"
ba1rsn2ststd ="R1 BA9 2NO STNDM PRXY FELT UNSAF"
ba1rsn3ststd ="R1 BA9 3 NO STNDM INTR FELT UNSF"
ba1rsn4ststd ="R1 BA9 4NO STNDM SP UNABL2UNDSTD"
ba1rsn9ststd ="R1 BA9 9 NO STNDM OTHER SPECIFY"
ba1ftdmreslt ="R1 BA11 FULL TANDEM STAND RESULT"
ba1ftdmsecs ="R1 BA12A SECS HLD FULL TANDM STD"
ba1ftdmhndr ="R1 BA12B HNRDS HLD FLL TANDM STD"
ba1rsn1ftstd ="R1 BA13 1 NO FTNDM SP FLT UNSAFE"
ba1rsn2ftstd ="R1 BA13 2NO FTNDM PRXY FLT UNSAF"
ba1rsn3ftstd ="R1 BA13 3 NO FTNDM INTR FLT UNSF"
ba1rsn4ftstd ="R1 BA13 4NO FTNDM SP UNABL2UNDST"
ba1rsn9ftstd ="R1 BA13 9 NO FTNDM OTHER SPECIFY"
ba11leoreslt ="R1 BA15 ONE LEG STAND EYES OPEN"
ba11leosfsec ="R1 BA16A SECS HLD 1LEG EYES OPEN"
ba11leohndr ="R1 BA16B HNRDS HLD 1LEG EYE OPEN"
ba1rsn11leo ="R1 BA17 1 NO1LEGEO SP FLT UNSAFE"
ba1rsn21leo ="R1 BA17 2NO1LEGEO PRXY FLT UNSAF"
ba1rsn31leo ="R1 BA17 3 NO1LEGEO INTR FLT UNSF"
ba1rsn41leo ="R1 BA17 4NO1LEGEO SP UNABL2UNDST"
ba1rsn91leo ="R1 BA17 9NO1LEGEO OTHER SPECIFY"
ba11lecreslt ="R1 BA19 ONE LEG STAND EYES CLOS"
ba11lecsfsec ="R1 BA20A SECS HLD 1LEG EYES CLOS"
ba11lechndr ="R1 BA20B HNRDS HLD 1LEG EYE CLOS"
ba1rsn11lec ="R1 BA21 1 NO1LEGEC SP FLT UNSAFE"
ba1rsn21lec ="R1 BA21 2NO1LEGEC PRXY FLT UNSAF"
ba1rsn31lec ="R1 BA21 3 NO1LEGEC INTR FLT UNSF"
ba1rsn41lec ="R1 BA21 4NO1LEGEC SP UNABL2UNDST"
ba1rsn91lec ="R1 BA21 9NO1LEGEC OTHER SPECIFY"
wa1wlkcorspc ="R1 WA2 WALKING COURSE SPACE"
wa1wkaidused ="R1 WA4 WALKING AID USED COURSE 1"
wa1wlkc1rslt ="R1 WA5 WALKING COURSE 1 RESULT"
wa1wlkc1secs ="R1 WA6A SECS HLD WALKNG COURSE1"
wa1wlk1hndr ="R1 WA6B HNRDS HLD WALKNG COURSE1"
wa1rsn11wkc ="R1 WA7 1 WLKCOURS1 SP FLT UNSAFE"
wa1rsn21wkc ="R1 WA7 2WLKCOURS1 PRXY FLT UNSAF"
wa1rsn31wkc ="R1 WA7 3WLKCOURS1 INTR FLT UNSF"
wa1rsn41wkc ="R1 WA7 4WLKCOURS1 SP UNABL2UNDST"
wa1rsn51wkc ="R1 WA7 5WLKCOURS1 NOT APPR SPACE"
wa1rsn91wkc ="R1 WA7 9WLKCOURS1 OTHER SPECIFY"
wa1wkaidusc2 ="R1 WA4 WALKING AID USED COURSE 2"
wa1wlkc2rslt ="R1 WA9 WALKING COURSE 2 RESULT"
wa1wlkc2secs ="R1 WA10A SECS HLD WALKNG COURSE2"
wa1wlk2hndr ="R1 WA10B HNRDS HLD WALKNG COURS2"
wa1rsn12wkc ="R1 WA11 1 WKCOURS2 SP FLT UNSAFE"
wa1rsn22wkc ="R1 WA11 2WKCOURS2 PRXY FLT UNSAF"
wa1rsn32wkc ="R1 WA11 3WKCOURS2 INTR FLT UNSF"
wa1rsn42wkc ="R1 WA11 4WKCOURS2 SP UNABL2UNDST"
wa1rsn92wkc ="R1 WA11 9WKCOURS2 OTHER SPECIFY"
ch1chravail ="R1 CH2 APPROPRIATE CHAIR AVAIL"
ch1chstcompl ="R1 CH4 CHAIR STND COMPLETED TRY1"
ch1chairheit ="R1 CH5 CHAIR HEIGHT(INCHES)"
ch1whlchrusd ="R1 CH6 WHEELCHAIR USED"
ch1sgchstres ="R1 CH7 SINGLE CHAIR STAND RESLT"
ch1armuse ="R1 CH8 CHAIR STAND ARM USE"
ch1rsn11chs ="R1 CH9 1CH STAND1 SP FLT UNSAFE"
ch1rsn21chs ="R1 CH9 2CH STAND1 PRXY FLT UNSAF"
ch1rsn31chs ="R1 CH9 3CH STAND1 INTR FLT UNSF"
ch1rsn41chs ="R1 CH9 4CH STAND1 SP UNABL2UNDST"
ch1rsn51chs ="R1 CH9 5CH STAND1 NOT APPR CHAIR"
ch1rsn91chs ="R1 CH9 9CH STAND1 OTHER SPECIFY"
ch12chstrslt ="R1 CH12 REPEAT CHAIR STAND RSLTS"
ch1chstndsec ="R1 CH13A TIME REPEAT CH STD SECS"
ch1chstdhndr ="R1 CH13B TIME RPEAT CH STD HNRDS"
ch1chstddone ="R1 CH14 NUMBER CHAIR STANDS DONE"
ch1chstntdn1 ="R1 CH15 1 CH STD SP TIRED"
ch1chstntdn2 ="R1 CH15 2 CH STD SP USED ARMS"
ch1chstntdn3 ="R1 CH15 3 CH STD OVER 1 MIN"
ch1chstntdn4 ="R1 CH15 4 CH STD CNCRN SP SAFETY"
ch1chstntdn5 ="R1 CH15 5 CH STD SP STOPPED"
ch1chstntdn9 ="R1 CH15 9 CH STD OTHERSPECIFY"
ch1chstntat1 ="R1 CH16 1 NO CH ST SP UNSAFE"
ch1chstntat2 ="R1 CH16 2 NO CH ST PRXY UNSAFE"
ch1chstntat3 ="R1 CH16 3 NO CH ST INTV UNSAFE"
ch1chstntat4 ="R1 CH16 4 NO CH ST SP UNAB2UNDST"
ch1chstntat9 ="R1 CH16 9 NO CH ST OTHER SPEC"
gr1handtstd1 ="R1 GR3 GRIP1 TEST WHICH HAND"
gr1adjgr1ps3 ="R1 GR4 GRIP1POSITION ADJUST TO 3"
gr1grp1reslt ="R1 GR5 GRIP STRENGTH 1 RESULT"
gr1grp1rdng ="R1 GR6 GRP1 DISPLAY READING"
gr1grp1noat1 ="R1 GR7 1 SP FELT UNSAFE"
gr1grp1noat2 ="R1 GR7 2 PROXY FELT UNSAFE"
gr1grp1noat3 ="R1 GR7 3 INTERVIEWR FELT UNSAFE"
gr1grp1noat4 ="R1 GR7 4 SP UNABLE 2 UNDERSTAND"
gr1grp1noat9 ="R1 GR7 9 OTHER SPECIFY"
gr1handtstd2 ="R1 GR8 GRIP2 TEST WHICH HAND"
gr1adjgr2ps3 ="R1 GR9 GRIP2POSITION ADJUST TO 3"
gr1grp2reslt ="R1 GR10GRIP STRENGTH 2 RESULT"
gr1grp2rdng ="R1 GR11GRP2 DISPLAY READING"
gr1grp2noat1 ="R1 GR12 1 SP FELT UNSAFE"
gr1grp2noat2 ="R1 GR12 2 PROXY FELT UNSAFE"
gr1grp2noat3 ="R1 GR12 3 INTERVIEWR FELT UNSAFE"
gr1grp2noat4 ="R1 GR12 4 SP UNABLE 2 UNDERSTAND"
gr1grp2noat9 ="R1 GR12 9 OTHER SPECIFY"
wc1measdiff1 ="R1 WC2 1 MEAS DIFF NONE"
wc1measdiff2 ="R1 WC2 2 MEAS DIFF DIFF BREATH"
wc1measdiff3 ="R1 WC2 3 MEAS DIFF NOHOLD BREATH"
wc1measdiff4 ="R1 WC2 4 MEAS DIFF EFFORT PAIN"
wc1measdiff5 ="R1 WC2 5 MEAS DIFF EFFORT OTHER"
wc1measdiff6 ="R1 WC2 6 MEAS DIFF LOCATE NAVEL"
wc1measdiff9 ="R1 WC2 9 MEAS DIFF OTHER SPECIFY"
wc1waistrslt ="R1 W3 WAIST CIRCUMFRNC RESULTS"
wc1wstmsrinc ="R1 W4A WAIST MEASURE INCHES"
wc1wstmsrqrt ="R1W4B WAIST MEASURE QTR INCHES"
wc1wstbulkcl ="R1 WC5 BULKY CLOTHING WORN"
wc1whomeasur ="R1 WC6 WHO MEASURED"
wc1wstpostn ="R1 WC7 POSITION 4 WAIST MEASURE"
wc1wstnotat1 ="R1 WC8 1 NO WC SP FELT UNSAFE"
wc1wstnotat2 ="R1 WC8 2 NO WC PROXY UNSAFE"
wc1wstnotat3 ="R1 WC8 3 NO WC INTERVIEWR UNSAFE"
wc1wstnotat4 ="R1 WC8 4 NO WC SP UNABLE2UNDRSTD"
wc1wstnotat5 ="R1 WC8 5 NO WC SP REFUSED"
wc1wstnotat9 ="R1 WC8 9 NO WC OTHER SPECIFY"
pk1pkarf1pos ="R1 PK2 PEAK AIR FLOW 1 POSITION"
pk1pkarfl1ef ="R1 PK3 PK AIR FLW 1 EFFORT GIVEN"
pk1pkarfl1rs ="R1 PK4 PEAK AIR FLOW 1 RESULT"
pk1pkarfl1rd ="R1 PK5 PEAK AIR FLOW 1 READING"
pk1pk1noatt1 ="R1 PK6 1 PEAK NO SP FELT UNSAFE"
pk1pk1noatt2 ="R1 PK6 2 PEAK NO PROXY UNSAFE"
pk1pk1noatt3 ="R1 PK6 3 PEAK NO INTERVWR UNSAFE"
pk1pk1noatt4 ="R1 PK6 4 PEAK NO SP UNABL2UNDSTD"
pk1pk1noatt9 ="R1 PK6 9 PEAK NO OTHER SPECIFY"
pk1paf2posit ="R1 PK7 PEAK AIR FLOW 2 POSITION"
pk1pkafl3eff ="R1 PK8 PEAK AIR FLW 2 EFFRT GIVN"
pk1pkarfl2rs ="R1 PK9 PEAK AIR FLOW 2 RESULT"
pk1pkarfl2rd ="R1 PK10 PEAK AIR FLOW 2 READING"
pk1pk2noatt1 ="R1 PK11 1 PEAK NO SP FELT UNSAFE"
pk1pk2noatt2 ="R1 PK11 2 PEAK NO PROXY UNSAFE"
pk1pk2noatt3 ="R1 PK11 3 PEAK NO INTRVWR UNSAFE"
pk1pk2noatt4 ="R1 PK11 4 PEAK NO SP UNABL2UNDST"
pk1pk2noatt9 ="R1 PK11 9 PEAK NO OTHER SPECIFY"
cl1endtimhrs ="R1 CL1 HRS END TIME HOURS"
cl1endtimmin ="R1 CL1 MINS END TIME MINUTES"
cl1endtmampm ="R1 CL1 AMPM END TIME AM OR PM"
r1dnhatssppb ="R1 D NHATS SPPB SCORE"
r1dnhatsbasc ="R1 D NHATS BALANCE SCORE"
r1dnhatswksc ="R1 D NHATS WALK SCORE"
r1dnhatschsc ="R1 D NHATS REPEAT CHAIR SCORE"
r1dnhatsgrav ="R1 D NHATS AVG GRIP SCORE"
r1dnhatsgrb ="R1 D NHATS BEST GRIP SCORE"
r1dnhatspkav ="R1 D NHATS AVG AIR FLOW SCORE"
r1dnhatspkb ="R1 D NHATS BEST AIR FLOW SCORE"
r1dsppbmiss ="R1 D REASON MISSING SPPB"
r1dorigsppb ="R1 D ORIGINAL SPPB SCORE"
r1dorigbasc ="R1 D ORIGINAL BALNCE SCORE"
r1dorigwksc ="R1 D ORIGINAL WALK SCORE"
r1dorigchsc ="R1 D ORIGINAL REPEAT CHAIR SCORE"
hw1currweigh ="R1 HW2 YOU CURRENTLY WEIGH"
hw1weighat50 ="R1 HW3 WEIGH AT ABOUT AGE 50"
hw1lst10pnds ="R1 HW4 LOST 10 POUNDS IN LAST YR"
hw1trytolose ="R1 HW5 WERE YOU TRYNG LOSE WEGHT"
hw1howtallft ="R1 HW7 HOW TALL ARE YOU FEET"
hw1howtallin ="R1 HW8 HOW TALL ARE YOU INCHES"
hw1tal50feet ="R1 HW9 HOW TALL AT AGE 50 FEET"
hw1tal50inch ="R1 HW10 HOW TALL AT AGE 50 INCHS"
el1borninus ="R1 EL1 WERE YOU BORN IN THE US"
el1hlthchild ="R1 EL5 YOUR HEALTH AS CHILD"
el1fingrowup ="R1 EL6 WELL OFF FINANLY GROWG UP"
el1lvbhpar15 ="R1 EL7 LIV W BTH PRNTS TO AGE 15"
el1lvwmofaor ="R1 EL8 LIV W MOTHER FATHR OR OTH"
el1higstschl ="R1 EL10 HGHST DGREE SCOOL COMPLD"
el1mothalive ="R1 EL11 YOUR MOTHER STILL LIVING"
el1fathalive ="R1 EL12 YOUR FATHER STILL LIVING"
el1dage2us ="R1 D AGE CAME TO US"
el1dsameres ="R1 D CITY STATE NOW AND AGE 15"
rl1condspanh ="R1 RL5 INTRVIW CONDCTD IN SPANSH"
rl1spkothlan ="R1 RL6 SPEAK LANG OTH THN ENGLSH"
rl1unspokeng ="R1 RL7 HOW UNDRSTND SPOKEN ENGL"
rl1spkengwel ="R1 RL8 HOW WELL SPEAK ENGLISH"
rl1dracehisp ="R1 D RACE AND HISPANIC ETHNICITY"
va1serarmfor ="R1 VA1 SERVED IN ARMED FORCES"
va1memnatgrd ="R1 VA3 MEMBER OF NATIONAL GUARD"
wb1offelche1 ="R1 WB1 OFTEN YOU FEEL CHEERFUL"
wb1offelche2 ="R1 WB1 OFTEN YOU FEEL BORED"
wb1offelche3 ="R1 WB1 OFTEN YOU FEEL FULLOFLIFE"
wb1offelche4 ="R1 WB1 OFTEN YOU FEEL UPSET"
wb1truestme1 ="R1 WB2 SP LIFE HAS MEANING PURPS"
wb1truestme2 ="R1 WB2 SP FEELS CONFIDENT"
wb1truestme3 ="R1 WB2 SP GAVE UP IMPROVING LIFE"
wb1truestme4 ="R1 WB2 SP LIKES LIVING SITUATION"
wb1ageyofeel ="R1 WB3 AGE YOU FEEL MOST OF TIME"
wb1agrwstmt1 ="R1 WB4 SP SELF DETERMINATION"
wb1agrwstmt2 ="R1 WB4 SP WANTS-FINDS WAY TO DO"
wb1agrwstmt3 ="R1 WB4 SP ADJUSTS TO CHANGE"
ip1covmedcad ="R1 IP1 COVERD BY MEDICARE PART D"
ip1otdrugcov ="R1 IP2 DRUG COVERG SOME OTHR WAY"
ip1mgapmedsp ="R1 IP3 MEDIGAP OR MEDICARE SUPP"
ip1cmedicaid ="R1 IP4 COV BY STATE MEDICAID PRG"
ip1covtricar ="R1 IP5 COVERED BY TRICARE"
ip1nginsnurs ="R1 IP6 NONGOV INSR FOR NURS HOME"
ip1typcarco1 ="R1 IP7 LTC INS NURSNG HOME COVD"
ip1typcarco2 ="R1 IP7 LTC INS ASSISTD LVNG COVD"
ip1typcarco3 ="R1 IP7 LTC INS HOME HEALTH COVD"
ip1paypremms ="R1 IP8 HOW MUCH PAY IN PREMIUMS"
ip1longhadpl ="R1 IP9 HOW LONG HAD THIS POLICY"
ip1numyears ="R1 IP9A NUMBER OF YEARS"
ip1agepurpol ="R1 IP9B AGE WHEN PURCHSD POLICY"
lf1workfpay ="R1 LF1 WORKED FOR PAY RECENTLY"
lf1abstlstwk ="R1 LF2 ABSENT FRM JOB LAST WEEK"
lf1wrkplstmn ="R1 LF3 WORK FOR PAY IN LST MONTH"
lf1mrthnonjb ="R1 LF4 MOR THN ONE JOB LAST WEEK"
lf1hrswkwork ="R1 LF5 HRS PR WEEK WORK MAIN JOB"
lf1hrwrkltwk ="R1 LF6 HOURS WORK LAST WEEK"
lf1hrwrklstw ="R1 LF7 HOW MNY HOURS DID YOU WRK"
lf1oftpaid ="R1 LF8 HOW OFTN PAID ON MAIN JOB"
lf1lstpaychk ="R1 LF9 HOW MUCH LAST PAYCHECK"
lf1pychkamnt ="R1 LF9A PAYCHECK AMOUNT"
lf1perhrpay ="R1 LF9B PAY PER HOUR"
lf1perdaypay ="R1 LF9C PAY PER DAY"
lf1ernfrmwrk ="R1 LF10 AMT EARN FRM WRK LST MTH"
lf1occupaton ="R1 LF11 OCCUPATION MOST OF LIFE"
lf1doccpctgy ="R1 D LONGEST OCCUPATION CATEGORY"
lf1diffwrknw ="R1 LF12 DO THS WRK SOMETHNG DIFF"
lf1huswifwrk ="R1 LF13 HUSB WIFE PARTN PAY WORK"
lf1huwpaearn ="R1 LF14 HUS WIFE PAR PAY LAT MTH"
hp1ownrentot ="R1 HP1 OWN RENT OR OTHER"
hp1mrtpadoff ="R1 HP2 MORTGAGE PAID OFF"
hp1mthlymort ="R1 HP3 MORTGAGE PAYMNT EACH MNTH"
hp1mortpaymt ="R1 HP3A MORTGAGE PAYMENT AMOUNT"
hp1whnpayoff ="R1 HP3B WHEN EXPCT PAY OFF MORTG"
hp1amtstlowe ="R1 HP3C HOW MUCH STILL OWE"
hp1amoutowed ="R1 HP3D THE AMOUNT OWED IS"
hp1homevalue ="R1 HP4 PRESENT VALUE OF HOME"
hp1homvalamt ="R1 HP4A HOME VALUE AMOUNT"
hp1payrent ="R1 HP5 DO YOU PAY RENT"
hp1rentamt ="R1 HP6 RENT PAID EACH MONTH"
hp1rentamout ="R1 HP6A RENT AMOUNT"
hp1sec8pubsn ="R1 HP7 HME SEC 8 PUBL SENOR HOUS"
ia1recsspa1 ="R1 IA1 SP REC SOCIAL SECURITY"
ia1recsspa2 ="R1 IA1 SPOUSE PART REC SOC SEC"
ia1recsspa3 ="R1 IA1 NO SOC SECURTY PAYMNT REC"
ia1howrecssp ="R1 IA2 HOW REC SOC SEC PAY"
ia1recssils1 ="R1 IA4 SP RECEIVD SSI LAST MONTH"
ia1recssils2 ="R1 IA4 SPOUSE PRT REC SSI LST MO"
ia1recssils3 ="R1 IA4 NO SSI RECEIVD LAST MONTH"
ia1rvapayls1 ="R1 IA5 SP REC PAY FRM VA LAST MO"
ia1rvapayls2 ="R1 IA5 SPOUS PA REC VA PAY LSTMO"
ia1rvapayls3 ="R1 IA5 NO VA PAY REC LAST MONTH"
ia1penjobou1 ="R1 IA6 SP HAS PENSION PLAN"
ia1penjobou2 ="R1 IA6 SPOUSE HAS PENSION PLAN"
ia1penjobou3 ="R1 IA6 NO PENSION PLAN"
ia1iraothac1 ="R1 IA7 SP HAS IRA OTH RETIRE ACC"
ia1iraothac2 ="R1 IA7 SPOUSE HAS IRA OTHR ACC"
ia1iraothac3 ="R1 IA7 NO IRA OTHR RETIRE ACCT"
ia1mutfdstk1 ="R1 IA8 SP OWNS MUTUAL FUND STOCK"
ia1mutfdstk2 ="R1 IA8 SPOUSE OWNS FUNDS STOCK"
ia1mutfdstk3 ="R1 IA8 SP SPOUSE OWN FUNDS STOCK"
ia1mutfdstk4 ="R1 IA8 NO FUNDS OR STOCK OWNED"
ia1ownbond1 ="R1 IA9 SP OWNS BONDS"
ia1ownbond2 ="R1 IA9 SPOUSE OWNS BONDS"
ia1ownbond3 ="R1 IA9 SP SPOUSE OWN BONDS"
ia1ownbond4 ="R1 IA9 NO BONDS OWNED"
ia1bnkacccd1 ="R1 IA10 SP OWNS CHECK ACCT"
ia1bnkacccd2 ="R1 IA10 SPOUSE OWNS CHECK ACCT"
ia1bnkacccd3 ="R1 IA10 SP SPOUSE OWN CHECK ACCT"
ia1bnkacccd4 ="R1 IA10 NO CHECK ACCT OWNED"
ia1bnkacccd5 ="R1 IA10 SP OWNS SAVINGS ACCT"
ia1bnkacccd6 ="R1 IA10 SPOUSE OWNS SAVING ACCT"
ia1bnkacccd7 ="R1 IA10 SP SPOUSE OWN SAVNG ACT"
ia1bnkacccd8 ="R1 IA10 NO SAVINGS ACCT OWNED"
ia1bnkacccd9 ="R1 IA10 SP OWNS CDS"
ia1bnkaccc10 ="R1 IA10 SPOUSE OWNS CDS"
ia1bnkaccc11 ="R1 IA10 SP SPOUSE OWN CDS"
ia1bnkaccc12 ="R1 IA10 NO CDS OWNED"
ia1realestt1 ="R1 IA13 SP OWNS REAL ESTATE"
ia1realestt2 ="R1 IA13 SPOUSE OWNS REAL ESTATE"
ia1realestt3 ="R1 IA13 SP SPOUSE OWN REAL ESTTE"
ia1realestt4 ="R1 IA13 NO REAL ESTATE OWNED"
ia1ssrrpymnt ="R1 IA14 RECENT MTHLY SS RR PYMNT"
ia1ssrrjtamt ="R1 IA14A JOINT SS RR AMOUNT"
ia1ssrrjtest ="R1 IA14B ESTMT JOINT SSRR AMOUNT"
ia1ssrrspamt ="R1 IA15A SP SS RR AMOUNT"
ia1ssrrspest ="R1 IA15B ESTIMATE SP SS RR AMT"
ia1ssrrptamt ="R1 IA16A PARTNER SS RR AMT"
ia1ssrrptest ="R1 IA16B ESTIMT PARTNR SS RR AMT"
ia1ssipymnt ="R1 IA17 RECENT MTHLY SSI PAYMENT"
ia1ssijtamt ="R1 IA17A JOINT SSI AMT"
ia1ssijtest ="R1 1A17B ESTIMATE JOINT SSI AMT"
ia1ssispamt ="R1 IA18A SP SSI AMOUNT"
ia1ssispest ="R1 IA8B ESTIMATE SP SSI AMOUNT"
ia1ssiptamt ="R1 IA19A PARTNR SSI AMOUNT"
ia1ssiptest ="R1 IA19B ESTIMATE PARTNR SSI AMT"
ia1vapymnt ="R1 IA20 RECENT MNTHLY VA PAYMENT"
ia1vajtamt ="R1 IA20A JOINT VA AMOUNT"
ia1vajtest ="R1 IA20B ESTIMAT JOINT VA AMOUNT"
ia1vaspamt ="R1 IA21A SP VA AMOUNT"
ia1vaspest ="R1 IA21B ESTIMATE SP VA AMOUNT"
ia1vaptamt ="R1 IA22A PARTNR VA AMOUNT"
ia1vaptest ="R1 IA22B ESTIMATE PARTNR VA AMT"
ia1penpymt ="R1 IA23 RCNT MTH JOBPENSION PYMT"
ia1penjtamt ="R1 IA23A JOINT JOB PENSION AMT"
ia1penjtest ="R1 IA23B EST JOINT JOB PENSN AMT"
ia1penspamt ="R1 IA24A SP JOB PENSION AMOUNT"
ia1penspest ="R1 IA24B EST SP JOB PENSION AMT"
ia1penptamt ="R1 IA25A PARTNR JOB PENSN AMOUNT"
ia1penptest ="R1 IA25B EST PARTNR JOB PEN AMT"
ia1retworth ="R1 IA26 RETIREMENT ACCOUNT WORTH"
ia1retjtwrt ="R1 IA26A JOINT RETIR ACCT WORTH"
ia1retjtest ="R1 IA26B EST JOINT RET ACCT WRTH"
ia1retspwrt ="R1 IA27A SP RETIREMENT ACCT WRTH"
ia1retspest ="R1 IA27B EST SP RET ACCT WORTH"
ia1retptwrt ="R1 IA28A PRTNR RET ACCT WORTH"
ia1retptest ="R1 IA28B EST PARTNR ACCT WORTH"
ia1rtlmwdrw ="R1 IA29 RETRMNT WDRW AMT LST MTH"
ia1rtlmjtwdr ="R1 IA29A JOINT RET WDRW LST MTH"
ia1rtlmjtest ="R1 IA29B EST JONT RET WDR LS MTH"
ia1rtlmspwdr ="R1 IA30A SP RET WDRWL LAST MONTH"
ia1rtlmspest ="R1 IA30B EST SP RET WDR LST MNTH"
ia1rtlmptwdr ="R1 IA31A PARTNR RET WDR LST MTH"
ia1rtlmptest ="R1 IA31B EST PARTNR WDR LST MTH"
ia1rtyrwdrw ="R1 IA32 RETRMNT WDRWL AMT LST YR"
ia1rtyrjtamt ="R1 IA32A AMT JOINT RET WDR LS YR"
ia1rtyrjtest ="R1 IA32B EST JOINT RET WDR LS YR"
ia1rtyrspamt ="R1 IA33A SP AMT RCVWDR RET LS YR"
ia1rtyrspest ="R1 IA33B EST SP RCVWDR RET LS YR"
ia1rtyrptamt ="R1 IA34A PARTNR RCVWDR RET LS YR"
ia1rtyrptest ="R1 IA34B EST PRTNR WDR RET LS YR"
ia1skbdwrth ="R1 IA35 NONRETR STKS BNDS WRTH"
ia1skbdjtwrt ="R1 IA35A JOINT STKS BNDS WRTH"
ia1skbdjtest ="R1 IA35B EST JOINT STKS BNDS WRT"
ia1bndjtest ="R1 IA35C EST JOINT ONLY BNDS WRT"
ia1skbdspwrt ="R1 IA36A SP STKS BONDS WRTH"
ia1skbdspest ="R1 IA36B EST SP STKS BNDS WRTH"
ia1bndspest ="R1 IA36C EST SP ONLY BNDS WRTH"
ia1skbdptwrt ="R1 IA37A PARTNR STKS BNDS WRTH"
ia1skbdptest ="R1 IA37B PART EST STKS BNDS WRTH"
ia1bndptest ="R1 IA37C PART EST ONLY BNDS WRTH"
ia1bkcdwrth ="R1 IA38 BANK ACCT CD WORTH"
ia1bkcdjtwrt ="R1 IA38A JOINT BNK ACCT CD WRTH"
ia1bkcdjtest ="R1 IA38B EST JOINT BNK CD WRTH"
ia1bnkjtest ="R1 IA38C EST JOINT BNK NO CD WRT"
ia1bkcdspwrt ="R1 IA39A SP BNK CDS WORTH"
ia1bkcdspest ="R1 IA39B SP EST BNK ACCT CD WRTH"
ia1bnkspest ="R1 IA39C SP EST BNK NO CD WRTH"
ia1bkcdptwrt ="R1 IA40A PARTNR BNK ACCT CD WRTH"
ia1bkcdptest ="R1 IA40B EST PARTNR BNK CD WRTH"
ia1bnkptest ="R1 IA40C EST PART BNK NO CD WRTH"
ia1itdvinc ="R1 IA41 AMT INT DIV INCOME LS YR"
ia1itdvjtamt ="R1 IA41A JOINT INT DIV INC LS YR"
ia1itdvjtest ="R1 IA41B EST JNT INTDV INC LS YR"
ia1itdvspamt ="R1 IA42A SP INT DIV INCOME LS YR"
ia1itdvspest ="R1 IA42B EST SP INTDIV INC LS YR"
ia1itdvptamt ="R1 IA43A PART INT DIV INC LS YR"
ia1itdvptest ="R1 IA43B ESTPRT INT DV INC LS YR"
ia1brewrt ="R1 IA44 BUSINESS REALESTATE WRTH"
ia1brejtwrt ="R1 IA44A JOINT BUS REAL WRTH"
ia1brejtest ="R1 IA44B EST JOINT BUS REAL WRTH"
ia1brespwrt ="R1 IA45A SP BUS REAL WRTH"
ia1brespest ="R1 IA45B EST SP BUS REAL WRTH"
ia1breptwrt ="R1 IA46A PART BUS REAL WRTH"
ia1breptest ="R1 IA46B EST PART BUS RE WRTH"
ia1breiinc ="R1 IA47 BUS REALESTATE INC LS YR"
ia1breijtamt ="R1 IA47A JOINT BUS RE INC LS YR"
ia1breijtest ="R1 IA47B EST JNT BUS RE INC LSYR"
ia1breispamt ="R1 IA48A AMT SP BUS RE INC LS YR"
ia1breispest ="R1 IA48B EST SP BUS RE INC LS YR"
ia1breiptamt ="R1 IA49A PART BUS RE INC LS YR"
ia1breiptest ="R1 IA49B EST PRT BS RE INC LS YR"
ia1totinc ="R1 IA50 TOTAL INCOME"
ia1toincimf ="R1 F IMPUTED TOTAL INC FLG"
ia1toincim1 ="R1 IA50 IMPUTED TOTAL INC1"
ia1toincim2 ="R1 IA50 IMPUTED TOTAL INC2"
ia1toincim3 ="R1 IA50 IMPUTED TOTAL INC3"
ia1toincim4 ="R1 IA50 IMPUTED TOTAL INC4"
ia1toincim5 ="R1 IA50 IMPUTED TOTAL INC5"
ia1toincesjt ="R1 IA51A JOINT EST TOT INCOME"
ia1eincimjf ="R1 F IMPTD JOINT EST TOT INC FLG"
ia1eincimj1 ="R1 IA51A IMP EST JOINT TOT INC1"
ia1eincimj2 ="R1 IA51A IMP EST JOINT TOT INC2"
ia1eincimj3 ="R1 IA51A IMP EST JOINT TOT INC3"
ia1eincimj4 ="R1 IA51A IMP EST JOINT TOT INC4"
ia1eincimj5 ="R1 IA51A IMP EST JOINT TOT INC5"
ia1toincessg ="R1 IA51B SNGLE EST TOT INC"
ia1eincimsf ="R1 F IMPUTED SGL EST TOT INC FLG"
ia1eincims1 ="R1 IA51B IMP EST SP SGL TOT INC1"
ia1eincims2 ="R1 IA51B IMP EST SP SGL TOT INC2"
ia1eincims3 ="R1 IA51B IMP EST SP SGL TOT INC3"
ia1eincims4 ="R1 IA51B IMP EST SP SGL TOT INC4"
ia1eincims5 ="R1 IA51B IMP EST SP SGL TOT INC5"
co1owncartrv ="R1 CO1 OWN ANY CARS TRUCKS VANS"
co1manyvhcls ="R1 CO2 HOW MANY VEHICLES OWN"
co1valuevehi ="R1 CO3 VALUE HOW MUCH WOLD BRING"
co1vehivalue ="R1 CO3A VEHICLE VALUE"
ew1pycredbal ="R1 EW1 PAY OFF CREDIT CARD BALAN"
ew1crecardeb ="R1 EW2 TOTAL CREDIT CARD DEBT"
ew1credcdmed ="R1 EW3 CREDIT CARD MEDICAL CARE"
ew1amtcrdmed ="R1 EW4 AMT ON CARDS FOR MED CARE"
ew1medpaovtm ="R1 EW5 MED BILLS PAID OVERTIME"
ew1ampadovrt ="R1 EW6 AMT FOR MED BILL OVR TIME"
ew1finhlpfam ="R1 EW7 FINANCIAL HELP FRM FAMILY"
ew1whohelfi1 ="R1 EW8 CHILD HELPED FINANCIALLY"
ew1whohelfi2 ="R1 EW8 OTHER HELPED FINANCIALLY"
ew1atchhelyr ="R1 EW10 AMT FROM CHILDR LST YR"
ew1fingftfam ="R1 EW11 FINANCIAL GIFTS TO FAMLY"
ew1whregoth1 ="R1 EW12 SP GAVE CHILD FINCL HLP"
ew1whregoth2 ="R1 EW12 SP GAVE GRANDCHD FIN HLP"
ew1whregoth3 ="R1 EW12 SP GAVE OTHR FINANCL HLP"
ew1amthlpgiv ="R1 EW14 AMOUNT OF HELP GIVEN"
ew1progneed1 ="R1 EW15 SP RECEIVD FOOD STAMPS"
ew1progneed2 ="R1 EW15 SP REC OTHR FOOD ASST"
ew1progneed3 ="R1 EW15 SP REC GAS ENERGY ASST"
ls1evdayact1 ="R1 LS1 EATING W OUT HELP SP EQUP"
ls1evdayact2 ="R1 LS1 GET IN OUT BED W OUT HELP"
ls1evdayact3 ="R1 LS1 GET IN OUT CHR W OUT HELP"
ls1evdayact4 ="R1 LS1 WALK INSIDE WITHOUT HELP"
ls1evdayact5 ="R1 LS1 GO OUTSDE W OUT HLP SP EQ"
ls1evdayact6 ="R1 LS1 DRESSING WITHOUT HELP"
ls1evdayact7 ="R1 LS1 BATHING WITHOUT HELP"
ls1evdayact8 ="R1 LS1 TOILETING WITHOUT HELP"
ls1ableto1 ="R1 LS2 PREPARE MEALS W OUT HELP"
ls1ableto2 ="R1 LS2 LAUNDRY WITHOUT HELP"
ls1ableto3 ="R1 LS2 SP ABLE LIGHT HOUSEWORK"
ls1ableto4 ="R1 LS2 SHOP FOR GROC WOUT HELP"
ls1ableto5 ="R1 LS2 SP ABLE MANAGE MONEY"
ls1ableto6 ="R1 LS2 SP TAKE MEDS WOUT HELP"
ls1ableto7 ="R1 LS2 SP MAKE TELEPHONE CALLS"
ls1diskefrm1 ="R1 LS3 DIS KEEPS FROM MEAL PREP"
ls1diskefrm2 ="R1 LS3 DIS KEEPS FROM LAUNDRY"
ls1diskefrm3 ="R1 LS3 DIS KEEPS FRM LGHT HOUSWK"
ls1diskefrm4 ="R1 LS3 DIS KEEPS FRM SHOP GROC"
ls1diskefrm5 ="R1 LS3 DIS KEEPS FRM MANAGE MONY"
ls1diskefrm6 ="R1 LS3 DIS KEEPS FROM TAKE MEDS"
ls1diskefrm7 ="R1 LS3 DIS KEEPS FROM TELEPHONE"
ir1spattitud ="R1 IR2 SP ATTITUDE TOWARD INTVW"
ir1undrstand ="R1 IR3 SP UNDERSTAND QUESTION"
ir1sppresent ="R1 IR4 AMT OF INTERVIW SP PRESNT"
ir1intvwhlp ="R1 IR6 ANYONE HELP WITH INTVW"
ir1prsnhlp1 ="R1 IR6A SPOUSE HELPED WITH INTVW"
ir1prsnhlp2 ="R1 IR6A CHILD HELPED WITH INTVW"
ir1prsnhlp3 ="R1 IR6A RELATIVE HELP WITH INTVW"
ir1prsnhlp4 ="R1 IR6A FRIEND HELPED WITH INTVW"
ir1prsnhlp5 ="R1 IR6A STAFF HELPED WITH INTVW"
ir1prsnhlp6 ="R1 IR6A AIDE HELPED WITH INTVW"
ir1prsnhlp91 ="R1 IR6A OTHER HELPED WITH INTVW"
ir1sessions ="R1 IR12 MORE ONE INTVW SESSION"
ir1sessrsn1 ="R1 IR12A MORE 1 SESSION SP TIRED"
ir1sessrsn2 ="R1 IR12A MORE 1 SESSION SP ILL"
ir1sessrsn3 ="R1 IR12A MORE 1 SESSION SCHEDULE"
ir1sessrsn91 ="R1 IR12A MORE 1 SESSION OTHER"
ir1conhomapt ="R1 IR12C INTRV CONDTD AT HME/APT"
ir1insidhome ="R1 IR12E GO INSIDE HOME/APT/UNIT"
ir1condihom1 ="R1 IR13 PAINT PEELING IN SP HOME"
ir1condihom2 ="R1 IR13 PESTS IN SP HOME"
ir1condihom3 ="R1 IR13 BROKN FURNITURE SP HOME"
ir1condihom4 ="R1 IR13 FLOORING NEEDS REPAIR"
ir1condihom5 ="R1 IR13 HOME OTHR TRIPPING HAZRD"
ir1clutterr1 ="R1 IR14 CLUTTR IN INTERVIEW ROOM"
ir1clutterr2 ="R1 IR14 CLUTTR IN OTHR SP ROOMS"
ir1areacond1 ="R1 IR15 LITTER GLASS ON SDWLK ST"
ir1areacond2 ="R1 IR15 GRAFFITI ON BUILDG WALLS"
ir1areacond3 ="R1 IR15 VACANT HOUSES OR STORES"
ir1areacond4 ="R1 IR15 FORECLOSURE HOUSE SIGNS"
ir1condhome1 ="R1 IR16 BROKEN WINDOWS IN HOME"
ir1condhome2 ="R1 IR16 CRUMBLNG FOUNDTN IN HOME"
ir1condhome3 ="R1 IR16 MISSNG BRCKS SIDNG IN HM"
ir1condhome4 ="R1 IR16 ROOF PROBLEM IN HOME"
ir1condhome5 ="R1 IR16 BROKEN STEPS TO HOME"
ir1fqphnprsn ="R1 IR21 FQ IN PERSON OR BY PHONE"
fq1dfacdescr ="R1 FQ6 FACILITY TYPE"
FQ1DOSFACD ="R1 FQ6A OTHER SPECIFY FAC TYPE"
fq1prtlivnam ="R1 FQ8 FAC NM DIFF4PLC SP LIVES"
fq1dfacarea ="R1 FQ10 FACILITY AREA SP LIVES"
FQ1DOSFACA ="R1 FQ10A OTHER SPECIFY FAC AREA"
fq1assdnrsng ="R1 FQ11 ASSIST LIV OR NURSG HOME"
fq1othrlevls ="R1 FQ12 OTH LEVELS OF CARE AVAIL"
fq1whotlevl1 ="R1 FQ13 INDEPNDNT LIV CARE AVAIL"
fq1whotlevl2 ="R1 FQ13 ASSISTED LVNG CARE AVAIL"
fq1whotlevl3 ="R1 FQ13 ALZHEIMER CARE AVAIL"
fq1whotlevl4 ="R1 FQ13 NURSING HOME CARE AVAIL"
fq1whotlevl5 ="R1 FQ13 OTHR SPECIFY CARE AVAIL"
fq1servaval1 ="R1 FQ15 MEALS AVAIL"
fq1servaval2 ="R1 FQ15 HELP WITH MEDS AVAIL"
fq1servaval3 ="R1 FQ15 HELP W BATH DRESS AVAIL"
fq1servaval4 ="R1 FQ15 LAUNDRY SERVCS AVAIL"
fq1servaval5 ="R1 FQ15 HOUSEKEEPING SERV AVAIL"
fq1servaval6 ="R1 FQ15 TRANSPRT MED CARE PROV"
fq1servaval7 ="R1 FQ15 TRANSPRT TO STORE EVENT"
fq1servaval8 ="R1 FQ15 RECREATIONAL FAC AVAIL"
fq1servaval9 ="R1 FQ15 SOCIAL EVENTS AVAIL"
fq1paysourc1 ="R1 FQ16 SP OR SP FAMILY PAYMENT"
fq1paysourc2 ="R1 FQ16 SOC SEC SSI PAYMENT"
fq1paysourc3 ="R1 FQ16 MEDICAID PAYMENT"
fq1paysourc4 ="R1 FQ16 MEDICARE PAYMENT"
fq1paysourc5 ="R1 FQ16 PRIVATE INSURANCE PAYMNT"
fq1paysourc6 ="R1 FQ16 OTHR GOVT PAYMENT"
fq1totalpaym ="R1 FQ17 TOTAL PAYMENT FOR CARE"
fq1mnthlyamt ="R1 FQ18 TOT MTHLY AMT FOR CARE"
fq1primpayer ="R1 FQ19 PRIMARY PAYER FOR CARE"
fq1govsource ="R1 FQ20 GOVERNMENT SOURCE"
fq1dlocsp ="R1 D FQ6 6A 10 10A FOR SAMP WGT"
w1anfinwgt0 ="R1 FINAL ANALYTIC WGT FULL SAMP"
w1anfinwgt1 ="R1 FINAL ANALYTIC WGT REP 1"
w1anfinwgt2 ="R1 FINAL ANALYTIC WGT REP 2"
w1anfinwgt3 ="R1 FINAL ANALYTIC WGT REP 3"
w1anfinwgt4 ="R1 FINAL ANALYTIC WGT REP 4"
w1anfinwgt5 ="R1 FINAL ANALYTIC WGT REP 5"
w1anfinwgt6 ="R1 FINAL ANALYTIC WGT REP 6"
w1anfinwgt7 ="R1 FINAL ANALYTIC WGT REP 7"
w1anfinwgt8 ="R1 FINAL ANALYTIC WGT REP 8"
w1anfinwgt9 ="R1 FINAL ANALYTIC WGT REP 9"
w1anfinwgt10 ="R1 FINAL ANALYTIC WGT REP 10"
w1anfinwgt11 ="R1 FINAL ANALYTIC WGT REP 11"
w1anfinwgt12 ="R1 FINAL ANALYTIC WGT REP 12"
w1anfinwgt13 ="R1 FINAL ANALYTIC WGT REP 13"
w1anfinwgt14 ="R1 FINAL ANALYTIC WGT REP 14"
w1anfinwgt15 ="R1 FINAL ANALYTIC WGT REP 15"
w1anfinwgt16 ="R1 FINAL ANALYTIC WGT REP 16"
w1anfinwgt17 ="R1 FINAL ANALYTIC WGT REP 17"
w1anfinwgt18 ="R1 FINAL ANALYTIC WGT REP 18"
w1anfinwgt19 ="R1 FINAL ANALYTIC WGT REP 19"
w1anfinwgt20 ="R1 FINAL ANALYTIC WGT REP 20"
w1anfinwgt21 ="R1 FINAL ANALYTIC WGT REP 21"
w1anfinwgt22 ="R1 FINAL ANALYTIC WGT REP 22"
w1anfinwgt23 ="R1 FINAL ANALYTIC WGT REP 23"
w1anfinwgt24 ="R1 FINAL ANALYTIC WGT REP 24"
w1anfinwgt25 ="R1 FINAL ANALYTIC WGT REP 25"
w1anfinwgt26 ="R1 FINAL ANALYTIC WGT REP 26"
w1anfinwgt27 ="R1 FINAL ANALYTIC WGT REP 27"
w1anfinwgt28 ="R1 FINAL ANALYTIC WGT REP 28"
w1anfinwgt29 ="R1 FINAL ANALYTIC WGT REP 29"
w1anfinwgt30 ="R1 FINAL ANALYTIC WGT REP 30"
w1anfinwgt31 ="R1 FINAL ANALYTIC WGT REP 31"
w1anfinwgt32 ="R1 FINAL ANALYTIC WGT REP 32"
w1anfinwgt33 ="R1 FINAL ANALYTIC WGT REP 33"
w1anfinwgt34 ="R1 FINAL ANALYTIC WGT REP 34"
w1anfinwgt35 ="R1 FINAL ANALYTIC WGT REP 35"
w1anfinwgt36 ="R1 FINAL ANALYTIC WGT REP 36"
w1anfinwgt37 ="R1 FINAL ANALYTIC WGT REP 37"
w1anfinwgt38 ="R1 FINAL ANALYTIC WGT REP 38"
w1anfinwgt39 ="R1 FINAL ANALYTIC WGT REP 39"
w1anfinwgt40 ="R1 FINAL ANALYTIC WGT REP 40"
w1anfinwgt41 ="R1 FINAL ANALYTIC WGT REP 41"
w1anfinwgt42 ="R1 FINAL ANALYTIC WGT REP 42"
w1anfinwgt43 ="R1 FINAL ANALYTIC WGT REP 43"
w1anfinwgt44 ="R1 FINAL ANALYTIC WGT REP 44"
w1anfinwgt45 ="R1 FINAL ANALYTIC WGT REP 45"
w1anfinwgt46 ="R1 FINAL ANALYTIC WGT REP 46"
w1anfinwgt47 ="R1 FINAL ANALYTIC WGT REP 47"
w1anfinwgt48 ="R1 FINAL ANALYTIC WGT REP 48"
w1anfinwgt49 ="R1 FINAL ANALYTIC WGT REP 49"
w1anfinwgt50 ="R1 FINAL ANALYTIC WGT REP 50"
w1anfinwgt51 ="R1 FINAL ANALYTIC WGT REP 51"
w1anfinwgt52 ="R1 FINAL ANALYTIC WGT REP 52"
w1anfinwgt53 ="R1 FINAL ANALYTIC WGT REP 53"
w1anfinwgt54 ="R1 FINAL ANALYTIC WGT REP 54"
w1anfinwgt55 ="R1 FINAL ANALYTIC WGT REP 55"
w1anfinwgt56 ="R1 FINAL ANALYTIC WGT REP 56"
w1varstrat ="R1 VARIANCE ESTIMATION STRATUM"
w1varunit ="R1 VARIANCE ESTIMATION CLUSTER";

run;

