import 'dart:async';
import 'package:camera/camera.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:cross_file/cross_file.dart';
import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:vibration/vibration.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'login_screen.dart';
import 'signup_screen.dart';

class AlphabetItem {
  final String id;
  final String letter;
  final String sound;
  final String word;
  final String speechText;
  final String tip;

  AlphabetItem({
    required this.id,
    required this.letter,
    required this.sound,
    required this.word,
    required this.speechText,
    required this.tip,
  });
}

class VailaHomeScreen extends StatefulWidget {
  final String mode;
  final bool isDemo;
  final List<AlphabetItem>? demoItems;
  const VailaHomeScreen({
    super.key,
    this.mode = 'letters',
    this.isDemo = false,
    this.demoItems,
  });

  @override
  State<VailaHomeScreen> createState() => _VailaHomeScreenState();
}

class _VailaHomeScreenState extends State<VailaHomeScreen>
    with TickerProviderStateMixin {
  static const String apiUrl = 'https://vaila-app.onrender.com';
  static const String fallbackApiUrl = 'https://vaila-app.onrender.com';

  // ───── Instruction points for the popup ─────
  static const List<String> _instructionPoints = [
    'Look at the letter displayed on the screen',
    'Tap "Listen" to hear the correct pronunciation 3 times',
    'When ready, tap "Speak" to start recording your voice',
    'Say the letter sound clearly into the microphone',
    'Wait for the AI to evaluate your pronunciation',
    'If you pass, you will move to the next letter automatically',
    'Speak loudly and clearly for the best results',
  ];

  final List<AlphabetItem> _alphabets = [
    AlphabetItem(
        id: 'a',
        letter: 'a',
        sound: 'A',
        word: 'Apple',
        speechText: 'A',
        tip: 'Say Letter A!'),
    AlphabetItem(
        id: 'b',
        letter: 'b',
        sound: 'B',
        word: 'Ball',
        speechText: 'B',
        tip: 'Say Letter B!'),
    AlphabetItem(
        id: 'c',
        letter: 'c',
        sound: 'C',
        word: 'Cat',
        speechText: 'C',
        tip: 'Say Letter C!'),
    AlphabetItem(
        id: 'd',
        letter: 'd',
        sound: 'D',
        word: 'Dog',
        speechText: 'D',
        tip: 'Say Letter D!'),
    AlphabetItem(
        id: 'e',
        letter: 'e',
        sound: 'E',
        word: 'Elephant',
        speechText: 'E',
        tip: 'Say Letter E!'),
    AlphabetItem(
        id: 'f',
        letter: 'f',
        sound: 'F',
        word: 'Fish',
        speechText: 'F',
        tip: 'Say Letter F!'),
    AlphabetItem(
        id: 'g',
        letter: 'g',
        sound: 'G',
        word: 'Goat',
        speechText: 'G',
        tip: 'Say Letter G!'),
    AlphabetItem(
        id: 'h',
        letter: 'h',
        sound: 'H',
        word: 'Hat',
        speechText: 'H',
        tip: 'Say Letter H!'),
    AlphabetItem(
        id: 'i',
        letter: 'i',
        sound: 'I',
        word: 'Igloo',
        speechText: 'I',
        tip: 'Say Letter I!'),
    AlphabetItem(
        id: 'j',
        letter: 'j',
        sound: 'J',
        word: 'Jug',
        speechText: 'J',
        tip: 'Say Letter J!'),
    AlphabetItem(
        id: 'k',
        letter: 'k',
        sound: 'K',
        word: 'Kite',
        speechText: 'K',
        tip: 'Say Letter K!'),
    AlphabetItem(
        id: 'l',
        letter: 'l',
        sound: 'L',
        word: 'Lion',
        speechText: 'L',
        tip: 'Say Letter L!'),
    AlphabetItem(
        id: 'm',
        letter: 'm',
        sound: 'M',
        word: 'Monkey',
        speechText: 'M',
        tip: 'Say Letter M!'),
    AlphabetItem(
        id: 'n',
        letter: 'n',
        sound: 'N',
        word: 'Nest',
        speechText: 'N',
        tip: 'Say Letter N!'),
    AlphabetItem(
        id: 'o',
        letter: 'o',
        sound: 'O',
        word: 'Orange',
        speechText: 'O',
        tip: 'Say Letter O!'),
    AlphabetItem(
        id: 'p',
        letter: 'p',
        sound: 'P',
        word: 'Parrot',
        speechText: 'P',
        tip: 'Say Letter P!'),
    AlphabetItem(
        id: 'q',
        letter: 'q',
        sound: 'Q',
        word: 'Queen',
        speechText: 'Q',
        tip: 'Say Letter Q!'),
    AlphabetItem(
        id: 'r',
        letter: 'r',
        sound: 'R',
        word: 'Rabbit',
        speechText: 'R',
        tip: 'Say Letter R!'),
    AlphabetItem(
        id: 's',
        letter: 's',
        sound: 'S',
        word: 'Snake',
        speechText: 'S',
        tip: 'Say Letter S!'),
    AlphabetItem(
        id: 't',
        letter: 't',
        sound: 'T',
        word: 'Tiger',
        speechText: 'T',
        tip: 'Say Letter T!'),
    AlphabetItem(
        id: 'u',
        letter: 'u',
        sound: 'U',
        word: 'Umbrella',
        speechText: 'U',
        tip: 'Say Letter U!'),
    AlphabetItem(
        id: 'v',
        letter: 'v',
        sound: 'V',
        word: 'Van',
        speechText: 'V',
        tip: 'Say Letter V!'),
    AlphabetItem(
        id: 'w',
        letter: 'w',
        sound: 'W',
        word: 'Whale',
        speechText: 'W',
        tip: 'Say Letter W!'),
    AlphabetItem(
        id: 'x',
        letter: 'x',
        sound: 'X',
        word: 'Xylophone',
        speechText: 'X',
        tip: 'Say Letter X!'),
    AlphabetItem(
        id: 'y',
        letter: 'y',
        sound: 'Y',
        word: 'Yak',
        speechText: 'Y',
        tip: 'Say Letter Y!'),
    AlphabetItem(
        id: 'z',
        letter: 'z',
        sound: 'Z',
        word: 'Zebra',
        speechText: 'Z',
        tip: 'Say Letter Z!'),
  ];

  final List<AlphabetItem> _numbers = [
    AlphabetItem(id: '1', letter: '1', sound: 'One', word: 'One', speechText: 'One', tip: 'Say One!'),
    AlphabetItem(id: '2', letter: '2', sound: 'Two', word: 'Two', speechText: 'Two', tip: 'Say Two!'),
    AlphabetItem(id: '3', letter: '3', sound: 'Three', word: 'Three', speechText: 'Three', tip: 'Say Three!'),
    AlphabetItem(id: '4', letter: '4', sound: 'Four', word: 'Four', speechText: 'Four', tip: 'Say Four!'),
    AlphabetItem(id: '5', letter: '5', sound: 'Five', word: 'Five', speechText: 'Five', tip: 'Say Five!'),
    AlphabetItem(id: '6', letter: '6', sound: 'Six', word: 'Six', speechText: 'Six', tip: 'Say Six!'),
    AlphabetItem(id: '7', letter: '7', sound: 'Seven', word: 'Seven', speechText: 'Seven', tip: 'Say Seven!'),
    AlphabetItem(id: '8', letter: '8', sound: 'Eight', word: 'Eight', speechText: 'Eight', tip: 'Say Eight!'),
    AlphabetItem(id: '9', letter: '9', sound: 'Nine', word: 'Nine', speechText: 'Nine', tip: 'Say Nine!'),
    AlphabetItem(id: '10', letter: '10', sound: 'Ten', word: 'Ten', speechText: 'Ten', tip: 'Say Ten!'),
    AlphabetItem(id: '11', letter: '11', sound: 'Eleven', word: 'Eleven', speechText: 'Eleven', tip: 'Say Eleven!'),
    AlphabetItem(id: '12', letter: '12', sound: 'Twelve', word: 'Twelve', speechText: 'Twelve', tip: 'Say Twelve!'),
    AlphabetItem(id: '13', letter: '13', sound: 'Thirteen', word: 'Thirteen', speechText: 'Thirteen', tip: 'Say Thirteen!'),
    AlphabetItem(id: '14', letter: '14', sound: 'Fourteen', word: 'Fourteen', speechText: 'Fourteen', tip: 'Say Fourteen!'),
    AlphabetItem(id: '15', letter: '15', sound: 'Fifteen', word: 'Fifteen', speechText: 'Fifteen', tip: 'Say Fifteen!'),
    AlphabetItem(id: '16', letter: '16', sound: 'Sixteen', word: 'Sixteen', speechText: 'Sixteen', tip: 'Say Sixteen!'),
    AlphabetItem(id: '17', letter: '17', sound: 'Seventeen', word: 'Seventeen', speechText: 'Seventeen', tip: 'Say Seventeen!'),
    AlphabetItem(id: '18', letter: '18', sound: 'Eighteen', word: 'Eighteen', speechText: 'Eighteen', tip: 'Say Eighteen!'),
    AlphabetItem(id: '19', letter: '19', sound: 'Nineteen', word: 'Nineteen', speechText: 'Nineteen', tip: 'Say Nineteen!'),
    AlphabetItem(id: '20', letter: '20', sound: 'Twenty', word: 'Twenty', speechText: 'Twenty', tip: 'Say Twenty!'),
    AlphabetItem(id: '30', letter: '30', sound: 'Thirty', word: 'Thirty', speechText: 'Thirty', tip: 'Say Thirty!'),
    AlphabetItem(id: '40', letter: '40', sound: 'Forty', word: 'Forty', speechText: 'Forty', tip: 'Say Forty!'),
    AlphabetItem(id: '50', letter: '50', sound: 'Fifty', word: 'Fifty', speechText: 'Fifty', tip: 'Say Fifty!'),
    AlphabetItem(id: '60', letter: '60', sound: 'Sixty', word: 'Sixty', speechText: 'Sixty', tip: 'Say Sixty!'),
    AlphabetItem(id: '70', letter: '70', sound: 'Seventy', word: 'Seventy', speechText: 'Seventy', tip: 'Say Seventy!'),
    AlphabetItem(id: '80', letter: '80', sound: 'Eighty', word: 'Eighty', speechText: 'Eighty', tip: 'Say Eighty!'),
    AlphabetItem(id: '90', letter: '90', sound: 'Ninety', word: 'Ninety', speechText: 'Ninety', tip: 'Say Ninety!'),
    AlphabetItem(id: '100', letter: '100', sound: 'One Hundred', word: 'Hundred', speechText: 'One Hundred', tip: 'Say One Hundred!'),
    AlphabetItem(id: '1000', letter: '1000', sound: 'One Thousand', word: 'Thousand', speechText: 'One Thousand', tip: 'Say One Thousand!'),
  ];

  // Urdu word family, series 1: the "-aal" rhyme series (30 words).
  final List<AlphabetItem> _urduAlphabets = [
    AlphabetItem(id: 'ال', letter: 'ال', sound: 'Al', word: 'ال', speechText: 'ال', tip: 'Say Al!'),
    AlphabetItem(id: 'آل', letter: 'آل', sound: 'Aal', word: 'آل', speechText: 'آل', tip: 'Say Aal!'),
    AlphabetItem(id: 'بال', letter: 'بال', sound: 'Baal', word: 'بال', speechText: 'بال', tip: 'Say Baal!'),
    AlphabetItem(id: 'پال', letter: 'پال', sound: 'Paal', word: 'پال', speechText: 'پال', tip: 'Say Paal!'),
    AlphabetItem(id: 'تال', letter: 'تال', sound: 'Taal', word: 'تال', speechText: 'تال', tip: 'Say Taal!'),
    AlphabetItem(id: 'ٹال', letter: 'ٹال', sound: 'Ṭaal', word: 'ٹال', speechText: 'ٹال', tip: 'Say Ṭaal!'),
    AlphabetItem(id: 'ثال', letter: 'ثال', sound: 'Saal', word: 'ثال', speechText: 'ثال', tip: 'Say Saal!'),
    AlphabetItem(id: 'جال', letter: 'جال', sound: 'Jaal', word: 'جال', speechText: 'جال', tip: 'Say Jaal!'),
    AlphabetItem(id: 'چال', letter: 'چال', sound: 'Chaal', word: 'چال', speechText: 'چال', tip: 'Say Chaal!'),
    AlphabetItem(id: 'حال', letter: 'حال', sound: 'Haal', word: 'حال', speechText: 'حال', tip: 'Say Haal!'),
    AlphabetItem(id: 'خال', letter: 'خال', sound: 'Khaal', word: 'خال', speechText: 'خال', tip: 'Say Khaal!'),
    AlphabetItem(id: 'دال', letter: 'دال', sound: 'Daal', word: 'دال', speechText: 'دال', tip: 'Say Daal!'),
    AlphabetItem(id: 'ڈال', letter: 'ڈال', sound: 'Ḍaal', word: 'ڈال', speechText: 'ڈال', tip: 'Say Ḍaal!'),
    AlphabetItem(id: 'ذال', letter: 'ذال', sound: 'Zaal', word: 'ذال', speechText: 'ذال', tip: 'Say Zaal!'),
    AlphabetItem(id: 'رال', letter: 'رال', sound: 'Raal', word: 'رال', speechText: 'رال', tip: 'Say Raal!'),
    AlphabetItem(id: 'ڑال', letter: 'ڑال', sound: 'Ṛaal', word: 'ڑال', speechText: 'ڑال', tip: 'Say Ṛaal!'),
    AlphabetItem(id: 'زال', letter: 'زال', sound: 'Zaal', word: 'زال', speechText: 'زال', tip: 'Say Zaal!'),
    AlphabetItem(id: 'سال', letter: 'سال', sound: 'Saal', word: 'سال', speechText: 'سال', tip: 'Say Saal!'),
    AlphabetItem(id: 'شال', letter: 'شال', sound: 'Shaal', word: 'شال', speechText: 'شال', tip: 'Say Shaal!'),
    AlphabetItem(id: 'غال', letter: 'غال', sound: 'Ghaal', word: 'غال', speechText: 'غال', tip: 'Say Ghaal!'),
    AlphabetItem(id: 'فال', letter: 'فال', sound: 'Faal', word: 'فال', speechText: 'فال', tip: 'Say Faal!'),
    AlphabetItem(id: 'قال', letter: 'قال', sound: 'Qaal', word: 'قال', speechText: 'قال', tip: 'Say Qaal!'),
    AlphabetItem(id: 'کال', letter: 'کال', sound: 'Kaal', word: 'کال', speechText: 'کال', tip: 'Say Kaal!'),
    AlphabetItem(id: 'گال', letter: 'گال', sound: 'Gaal', word: 'گال', speechText: 'گال', tip: 'Say Gaal!'),
    AlphabetItem(id: 'لال', letter: 'لال', sound: 'Laal', word: 'لال', speechText: 'لال', tip: 'Say Laal!'),
    AlphabetItem(id: 'مال', letter: 'مال', sound: 'Maal', word: 'مال', speechText: 'مال', tip: 'Say Maal!'),
    AlphabetItem(id: 'نال', letter: 'نال', sound: 'Naal', word: 'نال', speechText: 'نال', tip: 'Say Naal!'),
    AlphabetItem(id: 'وال', letter: 'وال', sound: 'Waal', word: 'وال', speechText: 'وال', tip: 'Say Waal!'),
    AlphabetItem(id: 'حال', letter: 'حال', sound: 'Haal', word: 'حال', speechText: 'حال', tip: 'Say Haal!'),
    AlphabetItem(id: 'یال', letter: 'یال', sound: 'Yaal', word: 'یال', speechText: 'یال', tip: 'Say Yaal!'),
    // Series 2: the "-aam" rhyme series (20 words).
    AlphabetItem(id: 'آم', letter: 'آم', sound: 'Aam', word: 'آم', speechText: 'آم', tip: 'Say Aam!'),
    AlphabetItem(id: 'بام', letter: 'بام', sound: 'Baam', word: 'بام', speechText: 'بام', tip: 'Say Baam!'),
    AlphabetItem(id: 'پام', letter: 'پام', sound: 'Paam', word: 'پام', speechText: 'پام', tip: 'Say Paam!'),
    AlphabetItem(id: 'تام', letter: 'تام', sound: 'Taam', word: 'تام', speechText: 'تام', tip: 'Say Taam!'),
    AlphabetItem(id: 'جام', letter: 'جام', sound: 'Jaam', word: 'جام', speechText: 'جام', tip: 'Say Jaam!'),
    AlphabetItem(id: 'چام', letter: 'چام', sound: 'Chaam', word: 'چام', speechText: 'چام', tip: 'Say Chaam!'),
    AlphabetItem(id: 'حام', letter: 'حام', sound: 'Haam', word: 'حام', speechText: 'حام', tip: 'Say Haam!'),
    AlphabetItem(id: 'خام', letter: 'خام', sound: 'Khaam', word: 'خام', speechText: 'خام', tip: 'Say Khaam!'),
    AlphabetItem(id: 'دام', letter: 'دام', sound: 'Daam', word: 'دام', speechText: 'دام', tip: 'Say Daam!'),
    AlphabetItem(id: 'رام', letter: 'رام', sound: 'Raam', word: 'رام', speechText: 'رام', tip: 'Say Raam!'),
    AlphabetItem(id: 'سام', letter: 'سام', sound: 'Saam', word: 'سام', speechText: 'سام', tip: 'Say Saam!'),
    AlphabetItem(id: 'شام', letter: 'شام', sound: 'Shaam', word: 'شام', speechText: 'شام', tip: 'Say Shaam!'),
    AlphabetItem(id: 'عام', letter: 'عام', sound: 'Aam', word: 'عام', speechText: 'عام', tip: 'Say Aam!'),
    AlphabetItem(id: 'فام', letter: 'فام', sound: 'Faam', word: 'فام', speechText: 'فام', tip: 'Say Faam!'),
    AlphabetItem(id: 'کام', letter: 'کام', sound: 'Kaam', word: 'کام', speechText: 'کام', tip: 'Say Kaam!'),
    AlphabetItem(id: 'گام', letter: 'گام', sound: 'Gaam', word: 'گام', speechText: 'گام', tip: 'Say Gaam!'),
    AlphabetItem(id: 'لام', letter: 'لام', sound: 'Laam', word: 'لام', speechText: 'لام', tip: 'Say Laam!'),
    AlphabetItem(id: 'نام', letter: 'نام', sound: 'Naam', word: 'نام', speechText: 'نام', tip: 'Say Naam!'),
    AlphabetItem(id: 'وام', letter: 'وام', sound: 'Waam', word: 'وام', speechText: 'وام', tip: 'Say Waam!'),
    AlphabetItem(id: 'حام', letter: 'حام', sound: 'Haam', word: 'حام', speechText: 'حام', tip: 'Say Haam!'),
    // Series 3: the "-aan" rhyme series (17 words).
    AlphabetItem(id: 'ان', letter: 'ان', sound: 'An', word: 'ان', speechText: 'ان', tip: 'Say An!'),
    AlphabetItem(id: 'آن', letter: 'آن', sound: 'Aan', word: 'آن', speechText: 'آن', tip: 'Say Aan!'),
    AlphabetItem(id: 'بان', letter: 'بان', sound: 'Baan', word: 'بان', speechText: 'بان', tip: 'Say Baan!'),
    AlphabetItem(id: 'پان', letter: 'پان', sound: 'Paan', word: 'پان', speechText: 'پان', tip: 'Say Paan!'),
    AlphabetItem(id: 'تان', letter: 'تان', sound: 'Taan', word: 'تان', speechText: 'تان', tip: 'Say Taan!'),
    AlphabetItem(id: 'جان', letter: 'جان', sound: 'Jaan', word: 'جان', speechText: 'جان', tip: 'Say Jaan!'),
    AlphabetItem(id: 'حان', letter: 'حان', sound: 'Haan', word: 'حان', speechText: 'حان', tip: 'Say Haan!'),
    AlphabetItem(id: 'خان', letter: 'خان', sound: 'Khaan', word: 'خان', speechText: 'خان', tip: 'Say Khaan!'),
    AlphabetItem(id: 'دان', letter: 'دان', sound: 'Daan', word: 'دان', speechText: 'دان', tip: 'Say Daan!'),
    AlphabetItem(id: 'ڈان', letter: 'ڈان', sound: 'Ḍaan', word: 'ڈان', speechText: 'ڈان', tip: 'Say Ḍaan!'),
    AlphabetItem(id: 'ران', letter: 'ران', sound: 'Raan', word: 'ران', speechText: 'ران', tip: 'Say Raan!'),
    AlphabetItem(id: 'سان', letter: 'سان', sound: 'Saan', word: 'سان', speechText: 'سان', tip: 'Say Saan!'),
    AlphabetItem(id: 'شان', letter: 'شان', sound: 'Shaan', word: 'شان', speechText: 'شان', tip: 'Say Shaan!'),
    AlphabetItem(id: 'فان', letter: 'فان', sound: 'Faan', word: 'فان', speechText: 'فان', tip: 'Say Faan!'),
    AlphabetItem(id: 'کان', letter: 'کان', sound: 'Kaan', word: 'کان', speechText: 'کان', tip: 'Say Kaan!'),
    AlphabetItem(id: 'لان', letter: 'لان', sound: 'Laan', word: 'لان', speechText: 'لان', tip: 'Say Laan!'),
    AlphabetItem(id: 'مان', letter: 'مان', sound: 'Maan', word: 'مان', speechText: 'مان', tip: 'Say Maan!'),
    // Series 4: the "ab/ap" family (4 words).
    AlphabetItem(id: 'اب', letter: 'اب', sound: 'Ab', word: 'اب', speechText: 'اب', tip: 'Say Ab!'),
    AlphabetItem(id: 'آب', letter: 'آب', sound: 'Aab', word: 'آب', speechText: 'آب', tip: 'Say Aab!'),
    AlphabetItem(id: 'اپ', letter: 'اپ', sound: 'Ap', word: 'اپ', speechText: 'اپ', tip: 'Say Ap!'),
    AlphabetItem(id: 'آپ', letter: 'آپ', sound: 'Aap', word: 'آپ', speechText: 'آپ', tip: 'Say Aap!'),
    // Series 5: the "ak/aag" family (8 words).
    AlphabetItem(id: 'اک', letter: 'اک', sound: 'Ak', word: 'اک', speechText: 'اک', tip: 'Say Ak!'),
    AlphabetItem(id: 'آگ', letter: 'آگ', sound: 'Aag', word: 'آگ', speechText: 'آگ', tip: 'Say Aag!'),
    AlphabetItem(id: 'باگ', letter: 'باگ', sound: 'Baag', word: 'باگ', speechText: 'باگ', tip: 'Say Baag!'),
    AlphabetItem(id: 'جاگ', letter: 'جاگ', sound: 'Jaag', word: 'جاگ', speechText: 'جاگ', tip: 'Say Jaag!'),
    AlphabetItem(id: 'راگ', letter: 'راگ', sound: 'Raag', word: 'راگ', speechText: 'راگ', tip: 'Say Raag!'),
    AlphabetItem(id: 'ساگ', letter: 'ساگ', sound: 'Saag', word: 'ساگ', speechText: 'ساگ', tip: 'Say Saag!'),
    AlphabetItem(id: 'لاگ', letter: 'لاگ', sound: 'Laag', word: 'لاگ', speechText: 'لاگ', tip: 'Say Laag!'),
    AlphabetItem(id: 'ناگ', letter: 'ناگ', sound: 'Naag', word: 'ناگ', speechText: 'ناگ', tip: 'Say Naag!'),
  ];

  static const Map<String, String> _letterPhoneticSounds = {
    'a': 'ah', 'b': 'buh', 'c': 'kuh', 'd': 'duh', 'e': 'eh',
    'f': 'feh', 'g': 'guh', 'h': 'huh', 'i': 'ih', 'j': 'juh',
    'k': 'kuh', 'l': 'leh', 'm': 'muh', 'n': 'nuh', 'o': 'oh',
    'p': 'puh', 'q': 'quh', 'r': 'ruh', 's': 'suh', 't': 'tuh',
    'u': 'uh', 'v': 'vuh', 'w': 'wuh', 'x': 'ks', 'y': 'yuh', 'z': 'zuh'
  };

  // Demo mode mixes items from all 3 categories in one list, so the active
  // category must be read off the current item itself rather than a single
  // fixed widget.mode — otherwise every demo item speaks with the alphabets
  // "X for Y Z" phrasing, even numbers/Urdu ones.
  bool get _isNumbersMode => widget.isDemo
      ? double.tryParse(_currentAlphabet.id) != null
      : widget.mode == 'numbers';
  bool get _isUrduMode => widget.isDemo
      ? _currentAlphabet.id.runes.any((r) => r >= 0x0600 && r <= 0x06FF)
      : widget.mode == 'urdu';
  List<AlphabetItem> get _items => widget.isDemo
      ? (widget.demoItems ?? const [])
      : (_isNumbersMode ? _numbers : (_isUrduMode ? _urduAlphabets : _alphabets));

  int _currentIndex = 0;
  AlphabetItem get _currentAlphabet => _items[_currentIndex];

  final FlutterTts _flutterTts = FlutterTts();
  final AudioRecorder _audioRecorder = AudioRecorder();
  late stt.SpeechToText _speechToText;
  bool _speechToTextAvailable = false;
  String _recognizedWords = '';

  bool _isSpeaking3x = false;
  int _speechCount = 0;

  bool _isReadyToSpeak = false;
  bool _isListeningWindow = false;
  int _timeLeft = 5;

  bool _voiceDetected = false;
  bool _isEvaluating = false;
  Map<String, dynamic>? _evalResult;

  late AnimationController _shakeController;
  late Animation<double> _shakeAnimation;

  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  Timer? _countdownTimer;
  Timer? _voiceStopTimer;
  StreamSubscription<Amplitude>? _amplitudeSubscription;

  double _peakVolumeDb = -160.0;
  bool _voiceDetectedFlag = false;
  bool _cancelTtsLoop = false;

  String _studentName = 'Learner';

  // ───── Live Camera state ─────
  CameraController? _cameraController;
  bool _isCameraInitialized = false;
  List<CameraDescription> _cameras = [];
  int _selectedCameraIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadLearnerName();
    _initTts();
    _initAudioStream();
    _initSpeechToText();
    _initCamera();

    _shakeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _shakeAnimation = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 0.0, end: -14.0), weight: 1),
      TweenSequenceItem(tween: Tween(begin: -14.0, end: 14.0), weight: 2),
      TweenSequenceItem(tween: Tween(begin: 14.0, end: -10.0), weight: 2),
      TweenSequenceItem(tween: Tween(begin: 10.0, end: 10.0), weight: 2),
      TweenSequenceItem(tween: Tween(begin: 10.0, end: 0.0), weight: 1),
    ]).animate(_shakeController);

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.3).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  void _loadLearnerName() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userStr = prefs.getString('vaila_user');
      String resolvedName = _studentName;
      if (userStr != null) {
        final userObj = jsonDecode(userStr);
        if (userObj['username'] != null && (userObj['username'] as String).isNotEmpty) {
          resolvedName = userObj['username'];
        }
      }
      final savedIndex = widget.isDemo
          ? null
          : prefs.getInt('vaila_progress_${resolvedName}_${widget.mode}');
      if (mounted) {
        setState(() {
          _studentName = widget.isDemo ? 'Demo' : resolvedName;
          if (savedIndex != null && savedIndex >= 0 && savedIndex < _items.length) {
            _currentIndex = savedIndex;
          }
        });
      }
    } catch (e) {
      print('Learner name load notice: $e');
    }
  }

  // Fire-and-forget: lets a student resume the exact word/letter they left
  // off on when they log out or switch to a different module, instead of
  // restarting the module from the beginning.
  void _saveProgress() {
    if (widget.isDemo) return; // demo attempts are anonymous/ephemeral — nothing to persist
    SharedPreferences.getInstance().then((prefs) {
      prefs.setInt('vaila_progress_${_studentName}_${widget.mode}', _currentIndex);
    });
  }

  void _handleLogout() async {
    _cancelTtsLoop = true;
    try { _flutterTts.stop(); } catch (_) {}
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('vaila_token');
    await prefs.remove('vaila_user');

    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  void _initSpeechToText() async {
    try {
      _speechToText = stt.SpeechToText();
      _speechToTextAvailable = await _speechToText.initialize(
        onError: (err) => print('Speech recognition error: $err'),
        onStatus: (status) => print('Speech recognition status: $status'),
      );
    } catch (e) {
      print('SpeechToText init exception: $e');
    }
  }

  void _initTts() async {
    if (_isUrduMode) {
      bool urduAvailable = false;
      for (final locale in ['ur-PK', 'ur-IN', 'ur']) {
        try {
          final available = await _flutterTts.isLanguageAvailable(locale);
          if (available == true || available == 1) {
            await _flutterTts.setLanguage(locale);
            urduAvailable = true;
            break;
          }
        } catch (_) {}
      }
      if (!urduAvailable) {
        // No Urdu voice installed on this device — fall back so TTS still
        // finishes setup and the Urdu script can still be read aloud,
        // just without native Urdu pronunciation.
        try { await _flutterTts.setLanguage('en-US'); } catch (_) {}
      }
    } else {
      try {
        await _flutterTts.setLanguage('en-US');
      } catch (_) {}
    }
    await _flutterTts.setSpeechRate(0.42);
    await _flutterTts.setPitch(1.25);
    await _flutterTts.awaitSpeakCompletion(true);
    if (kIsWeb) {
      try {
        var voices = await _flutterTts.getVoices;
        if (voices != null && voices is List) {
          for (var voice in voices) {
            final name = (voice['name'] ?? '').toString().toLowerCase();
            if (name.contains('female') || name.contains('zira') || name.contains('samantha') || name.contains('karen') || name.contains('google us english')) {
              await _flutterTts.setVoice({"name": voice['name'], "locale": voice['locale'] ?? 'en-US'});
              break;
            }
          }
        }
      } catch (_) {}
    }
  }

  void _initAudioStream() {
    try {
      _amplitudeSubscription = _audioRecorder
          .onAmplitudeChanged(const Duration(milliseconds: 100))
          .listen((amp) {
        if (!_isListeningWindow || _voiceDetectedFlag) return;
        final db = amp.current;

        const double speechThresholdDb = -24.0;
        if (db > speechThresholdDb && !_voiceDetectedFlag) {
          _voiceDetectedFlag = true;
          if (mounted) {
            setState(() {
              _voiceDetected = true;
            });
          }
        }
      });
    } catch (_) {}
  }

  @override
  void dispose() {
    _saveProgress();
    _countdownTimer?.cancel();
    _voiceStopTimer?.cancel();
    _amplitudeSubscription?.cancel();
    _shakeController.dispose();
    _pulseController.dispose();
    _flutterTts.stop();
    _audioRecorder.dispose();
    _cameraController?.dispose();
    try { _speechToText.stop(); } catch (_) {}
    super.dispose();
  }

  void _triggerShake() {
    _shakeController.forward(from: 0);
  }

  void _speakPhoneticSound3Times() async {
    if (_isSpeaking3x || _isListeningWindow || _isEvaluating) return;

    _cancelTtsLoop = false;
    setState(() {
      _isSpeaking3x = true;
      _evalResult = null;
    });

    final phoneticMap = {
      'a': 'ah', 'b': 'buh', 'c': 'kuh', 'd': 'duh', 'e': 'eh',
      'f': 'feh', 'g': 'guh', 'h': 'huh', 'i': 'ih', 'j': 'juh',
      'k': 'kuh', 'l': 'leh', 'm': 'muh', 'n': 'nuh', 'o': 'oh',
      'p': 'puh', 'q': 'quh', 'r': 'ruh', 's': 'suh', 't': 'tuh',
      'u': 'uh', 'v': 'vuh', 'w': 'wuh', 'x': 'ks', 'y': 'yuh', 'z': 'zuh'
    };
    final letter = _currentAlphabet.letter.toLowerCase();
    final phonic = phoneticMap[letter] ?? letter;
    final word = _currentAlphabet.word;
    // Urdu mode speaks the romanized letter name (e.g. "Alif") instead of the
    // raw Urdu script — most devices have no Urdu TTS voice installed, and
    // feeding Arabic-script text to an English voice produces silence rather
    // than an error, so the romanized form is what actually guarantees sound.
    final soundToSpeak = _isNumbersMode
        ? _currentAlphabet.sound
        : (_isUrduMode
            ? _currentAlphabet.sound
            : "${letter.toUpperCase()} for $phonic $word");

    for (int i = 0; i < 3; i++) {
      if (_cancelTtsLoop || !mounted) break;
      try {
        await _flutterTts.speak(soundToSpeak);
      } catch (e) {
        print('TTS speak error: $e');
      }
      await Future.delayed(const Duration(milliseconds: 600));
    }

    if (!mounted) return;
    setState(() {
      _isSpeaking3x = false;
      if (!_cancelTtsLoop) {
        _isReadyToSpeak = true;
      }
    });
  }

  void _startDetectionWindow() async {
    _countdownTimer?.cancel();
    _voiceStopTimer?.cancel();

    try {
      await _flutterTts.stop();
    } catch (_) {}
    await Future.delayed(const Duration(milliseconds: 350));

    if (!mounted) return;

    setState(() {
      _isReadyToSpeak = false;
      _isListeningWindow = true;
      _timeLeft = 5;
      _evalResult = null;
      _voiceDetected = true; // Always show "Recording your voice..." since mic is active
      _isEvaluating = false;
      _recognizedWords = '';
    });

    _voiceDetectedFlag = true;
    _pulseController.repeat(reverse: true);

    // Start ONLY hardware audio recorder (NO Google STT to avoid mic collision)
    try {
      if (await _audioRecorder.hasPermission()) {
        String path = '';
        if (!kIsWeb) {
          final tempDir = await getTemporaryDirectory();
          path = '${tempDir.path}/pronunciation_${DateTime.now().millisecondsSinceEpoch}.m4a';
        }

        final config = RecordConfig(
          encoder: kIsWeb ? AudioEncoder.wav : AudioEncoder.aacLc,
          sampleRate: 44100,
          numChannels: 1,
        );

        await _audioRecorder.start(config, path: path);
      }
    } catch (e) {
      print('Recording start exception: $e');
    }

    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_timeLeft > 1) {
        if (mounted) {
          setState(() {
            _timeLeft--;
          });
        }
      } else {
        timer.cancel();
        _finishDetectionWindow();
      }
    });
  }

  void _finishDetectionWindow() async {
    _countdownTimer?.cancel();
    _voiceStopTimer?.cancel();
    _pulseController.stop();

    // Small delay to ensure audio recorder captures the last moment of speech
    await Future.delayed(const Duration(milliseconds: 200));

    String? audioPath;
    try {
      if (await _audioRecorder.isRecording()) {
        audioPath = await _audioRecorder.stop();
      }
    } catch (e) {
      print('Recording stop exception: $e');
    }

    if (!mounted) return;
    setState(() {
      _isListeningWindow = false;
      _isEvaluating = true;
    });

    double score = 0;
    bool passed = false;
    String feedback = '';
    String transcription = '';

    try {
      final response = await _sendToBackend(audioPath ?? '', _currentAlphabet.letter, _recognizedWords);

      if (response != null) {
        score = (response['accuracy'] as num).toDouble();
        passed = response['passed'] ?? false;
        feedback = response['feedback'] ?? '';
        transcription = response['whisper_transcription'] ?? '';
      } else {
        score = 0.0;
        passed = false;
        feedback = "Evaluation notice: Unable to connect to server. Please try again!";
        transcription = "(server connection error)";
      }
    } catch (e) {
      score = 0.0;
      passed = false;
      feedback = "Please speak clearly into the microphone and try again!";
      transcription = "(error)";
    } finally {
      if (mounted) {
        setState(() {
          _isEvaluating = false;
          _evalResult = {
            'accuracy': score,
            'passed': passed,
            'feedback': feedback,
            'transcription': transcription,
          };
        });

        if (!passed) {
          _triggerShake();
        }
      }
    }
  }

  Future<Map<String, dynamic>?> _sendToBackend(String audioPath, String targetLetter, String spokenText) async {
    final urls = [apiUrl, fallbackApiUrl].toSet().toList();

    for (final baseUrl in urls) {
      try {
        final uri = Uri.parse('$baseUrl/api/evaluate-audio');
        final request = http.MultipartRequest('POST', uri);
        request.fields['target_alphabet'] = targetLetter;
        request.fields['spoken_text'] = spokenText;
        request.fields['student_id'] = _studentName;
        request.fields['is_demo'] = widget.isDemo ? 'true' : 'false';
        request.fields['source'] = 'app';

        if (audioPath.isNotEmpty) {
          try {
            if (kIsWeb) {
              final xFile = XFile(audioPath);
              final bytes = await xFile.readAsBytes();
              request.files.add(
                http.MultipartFile.fromBytes(
                  'file',
                  bytes,
                  filename: 'audio.wav',
                ),
              );
            } else {
              request.files.add(
                await http.MultipartFile.fromPath('file', audioPath),
              );
            }
          } catch (e) {
            print('Audio upload error: $e');
          }
        }

        final streamedResponse = await request.send().timeout(const Duration(seconds: 60));
        final response = await http.Response.fromStream(streamedResponse);

        if (response.statusCode == 200) {
          return jsonDecode(response.body);
        }
      } catch (e) {
        print('Backend evaluation request error: $e');
      }
    }
    return null;
  }

  void _handleNextAlphabet() {
    _cancelTtsLoop = true;
    try {
      _flutterTts.stop();
    } catch (_) {}

    setState(() {
      _evalResult = null;
      _isListeningWindow = false;
      _isReadyToSpeak = false;
      _voiceDetected = false;
      _isEvaluating = false;
      _currentIndex = (_currentIndex + 1) % _items.length;
    });
    _saveProgress();
  }

  // ───── Live Camera Controller Methods ─────
  void _initCamera() async {
    try {
      _cameras = await availableCameras();
      if (_cameras.isNotEmpty) {
        int frontCameraIndex = _cameras.indexWhere(
          (cam) => cam.lensDirection == CameraLensDirection.front,
        );
        _selectedCameraIndex = frontCameraIndex != -1 ? frontCameraIndex : 0;
        await _initializeCameraController(_cameras[_selectedCameraIndex]);
      }
    } catch (e) {
      print('Camera init error: $e');
    }
  }

  Future<void> _initializeCameraController(CameraDescription cameraDescription) async {
    final controller = CameraController(
      cameraDescription,
      ResolutionPreset.low,
      enableAudio: false,
    );
    _cameraController = controller;
    try {
      await controller.initialize();
      if (mounted) {
        setState(() {
          _isCameraInitialized = true;
        });
      }
    } catch (e) {
      print('Camera controller init error: $e');
    }
  }

  void _toggleCamera() async {
    if (_cameras.length < 2) return;
    _selectedCameraIndex = (_selectedCameraIndex + 1) % _cameras.length;
    if (mounted) {
      setState(() {
        _isCameraInitialized = false;
      });
    }
    await _cameraController?.dispose();
    await _initializeCameraController(_cameras[_selectedCameraIndex]);
  }

  // ───── NEW: Instructions Popup ─────
  void _showInstructionsPopup() {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        backgroundColor: Colors.white,
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E3A8A).withOpacity(0.12),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.help_outline_rounded, color: Color(0xFF7C5CFC), size: 24),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      "How to Practice",
                      style: GoogleFonts.outfit(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF1E3A8A),
                      ),
                    ),
                  ),
                  GestureDetector(
                    onTap: () => Navigator.of(ctx).pop(),
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.close_rounded, color: Color(0xFF64748B), size: 18),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              // Instruction bullet points
              ..._instructionPoints.asMap().entries.map((entry) => Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      margin: const EdgeInsets.only(top: 2),
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E3A8A).withOpacity(0.12),
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text(
                          '${entry.key + 1}',
                          style: GoogleFonts.outfit(
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                            color: const Color(0xFF388E3C),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.only(top: 2),
                        child: Text(
                          entry.value,
                          style: GoogleFonts.outfit(
                            fontSize: 14,
                            color: const Color(0xFF475569),
                            height: 1.4,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              )),
              const SizedBox(height: 8),
              // Got it button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF7C5CFC),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    elevation: 0,
                  ),
                  onPressed: () => Navigator.of(ctx).pop(),
                  child: Text(
                    "Got it!",
                    style: GoogleFonts.outfit(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  //  BUILD — Redesigned UI (light theme matching mockup)
  // ═══════════════════════════════════════════════════════════════════


  void _showExitPopup() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF333333),
        title: const Text(
          "Exit this lesson and choose another?",
          style: TextStyle(color: Colors.white, fontSize: 16),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text("Cancel", style: TextStyle(color: Colors.lightGreenAccent)),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              _cancelTtsLoop = true;
              try { _flutterTts.stop(); } catch (_) {}
              if (Navigator.of(context).canPop()) {
                Navigator.of(context).pop();
              }
            },
            child: const Text("OK", style: TextStyle(color: Colors.lightGreenAccent)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFBF8F1),
      body: SafeArea(
        child: Column(
          children: [
                        // ───── TOP BAR: Mirror, Logo, Exit ─────
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 10, 14, 0),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Camera Mirror (Top Left)
                  GestureDetector(
                    onTap: _toggleCamera,
                    child: Container(
                      width: 78,
                      height: 60,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        color: const Color(0xFFE0E7FF),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.08),
                            blurRadius: 10,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            if (_isCameraInitialized &&
                                _cameraController != null &&
                                _cameraController!.value.isInitialized)
                              FittedBox(
                                fit: BoxFit.cover,
                                child: SizedBox(
                                  width: _cameraController!.value.previewSize!.height,
                                  height: _cameraController!.value.previewSize!.width,
                                  child: CameraPreview(_cameraController!),
                                ),
                              )
                            else
                              const Center(child: Icon(Icons.person, color: Colors.grey)),
                            const Positioned(
                              bottom: 2,
                              left: 0,
                              right: 0,
                              child: Text(
                                "Mirror",
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  color: Color(0xFF1E3A8A),
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(width: 10),

                  // Title / Logo Section (Center)
                  Expanded(
                    child: Column(
                      children: [
                        Image.asset(
                          'assets/logo.jpg',
                          height: 108,
                          errorBuilder: (ctx, err, stack) => const Icon(Icons.hearing, color: Color(0xFF1E3A8A), size: 54),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          "VAILA'S Speech Trainer",
                          textAlign: TextAlign.center,
                          style: GoogleFonts.outfit(color: const Color(0xFF1E3A8A), fontSize: 17, fontWeight: FontWeight.w800),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          _isNumbersMode ? "NUMBERS" : (_isUrduMode ? "URDU" : "PHONICS"),
                          style: const TextStyle(color: Color(0xFFD32F2F), fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                        ),
                        const SizedBox(height: 3),
                        const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.star, color: Colors.amber, size: 13),
                            SizedBox(width: 4),
                            Text(
                              "Inclusive Learning For Every Child",
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Color(0xFF1E3A8A), fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                            SizedBox(width: 4),
                            Icon(Icons.star, color: Colors.amber, size: 13),
                          ],
                        )
                      ],
                    ),
                  ),

                  const SizedBox(width: 10),

                  // Exit and Guidance Buttons (Top Right)
                  Column(
                    children: [
                      GestureDetector(
                        onTap: _showExitPopup,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 4)],
                          ),
                          child: const Column(
                            children: [
                              Icon(Icons.close_rounded, color: Color(0xFFD32F2F), size: 24),
                              Text("Exit", style: TextStyle(color: Color(0xFFD32F2F), fontSize: 10, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      GestureDetector(
                        onTap: _showInstructionsPopup,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 4)],
                          ),
                          child: const Column(
                            children: [
                              Icon(Icons.lightbulb_outline, color: Colors.purple, size: 24),
                              Text("Guidance", style: TextStyle(color: Colors.purple, fontSize: 10, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            // ───── MAIN SCROLLABLE CONTENT ─────
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 22),
                child: Column(
                  children: [
                    const SizedBox(height: 14),

                    // Demo mode: persistent Sign Up CTA
                    if (widget.isDemo)
                      Container(
                        margin: const EdgeInsets.only(bottom: 14),
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => const SignupScreen()),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF10B981),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          icon: const Icon(Icons.person_add_alt_1_rounded),
                          label: Text(
                            "Enjoying it? Sign Up Now",
                            style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 15),
                          ),
                        ),
                      ),

                    // Playing 3x Sound Banner
                    if (_isSpeaking3x)
                      Container(
                        margin: const EdgeInsets.only(bottom: 18),
                        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 20),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E3A8A).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFF1E3A8A).withOpacity(0.25)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.volume_up_rounded, color: Color(0xFF7C5CFC), size: 20),
                            const SizedBox(width: 8),
                            Text(
                              "\"${_currentAlphabet.word}\" — $_speechCount of 3...",
                              style: GoogleFonts.outfit(
                                color: const Color(0xFF1E3A8A),
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),

                    // ───── Large Alphabet Letter (with shake animation) ─────
                    AnimatedBuilder(
                      animation: _shakeAnimation,
                      builder: (context, child) {
                        return Transform.translate(
                          offset: Offset(_shakeAnimation.value, 0),
                          child: child,
                        );
                      },
                      child: GestureDetector(
                        onTap: () {
                          if (!_isSpeaking3x && !_isListeningWindow && !_isEvaluating) {
                            _speakPhoneticSound3Times();
                          }
                        },
                        child: Text(
                          _isNumbersMode
                              ? _currentAlphabet.letter
                              : _currentAlphabet.letter.toUpperCase(),
                          style: GoogleFonts.outfit(
                            fontSize: _isNumbersMode ? 76 : 98,
                            fontWeight: FontWeight.w900,
                            color: const Color(0xFF1E3A8A),
                            height: 1.1,
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 4),

                    // Subtitle
                    Text(
                      "${_currentAlphabet.word}",
                      style: GoogleFonts.outfit(
                        fontSize: 17,
                        color: const Color(0xFF9CA3AF),
                        fontWeight: FontWeight.w500,
                      ),
                    ),

                    if (!_isNumbersMode) ...[
                      const SizedBox(height: 3),
                      Text(
                        _isUrduMode
                            ? "sounds like \"${_currentAlphabet.sound}\""
                            : "sounds like \"${_letterPhoneticSounds[_currentAlphabet.letter.toLowerCase()] ?? ''}\"",
                        style: GoogleFonts.outfit(
                          fontSize: 13,
                          color: const Color(0xFFB5B5C3),
                          fontWeight: FontWeight.w500,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ],

                    const SizedBox(height: 16),

                    // ───── Interactive Bottom Section ─────
                    _buildInteractiveBottomSection(),

                    const SizedBox(height: 10),
                  ],
                ),
              ),
            ),

            // ───── BOTTOM BAR: Progress ─────
            Container(
              padding: const EdgeInsets.fromLTRB(20, 10, 20, 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(26),
                  topRight: Radius.circular(26),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 12,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  // Progress Section
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Row(
                          children: [
                            Text(
                              "Your Progress",
                              style: GoogleFonts.outfit(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF64748B),
                              ),
                            ),
                            const SizedBox(width: 6),
                            Flexible(
                              child: Text(
                                "• ${_currentAlphabet.letter.toUpperCase()}  ${_currentIndex + 1}/${_items.length}",
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.outfit(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: const Color(0xFF1E3A8A),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        LayoutBuilder(
                          builder: (context, constraints) {
                            // Reserve space for the spacing + trophy icon, then size
                            // each dot so it always fits its share of the track —
                            // this stays overflow-safe no matter how many items there are.
                            final double trackWidth =
                                (constraints.maxWidth - 34).clamp(0, double.infinity);
                            final double segmentWidth =
                                _items.isEmpty ? 0 : trackWidth / _items.length;
                            double dotSize(double base) {
                              final double maxAllowed = segmentWidth * 0.85;
                              if (maxAllowed <= 0) return 0;
                              return base <= maxAllowed ? base : (maxAllowed < 4 ? 4.0 : maxAllowed);
                            }

                            return Row(
                              children: [
                                ...List.generate(_items.length, (index) {
                                  final bool isCompleted = index < _currentIndex;
                                  final bool isCurrent = index == _currentIndex;
                                  final bool isActive = isCompleted || isCurrent;
                                  final bool showDot = isCurrent ||
                                      index == 0 ||
                                      index == _items.length - 1;
                                  final double diameter =
                                      dotSize(isCurrent ? 16.0 : 12.0);

                                  return Expanded(
                                    child: Row(
                                      children: [
                                        if (index > 0)
                                          Expanded(
                                            child: Container(
                                              height: 2.5,
                                              decoration: BoxDecoration(
                                                color: isCompleted
                                                    ? const Color(0xFF1E3A8A)
                                                    : const Color(0xFFE2E8F0),
                                                borderRadius: BorderRadius.circular(2),
                                              ),
                                            ),
                                          ),
                                        if (showDot)
                                          Container(
                                            width: diameter,
                                            height: diameter,
                                            decoration: BoxDecoration(
                                              shape: BoxShape.circle,
                                              color: isActive
                                                  ? const Color(0xFF1E3A8A)
                                                  : const Color(0xFFE2E8F0),
                                            ),
                                          ),
                                      ],
                                    ),
                                  );
                                }),
                                const SizedBox(width: 10),
                                Icon(
                                  Icons.emoji_events_rounded,
                                  color: _currentIndex >= _items.length
                                      ? Colors.amber
                                      : const Color(0xFFD1D5DB),
                                  size: 24,
                                ),
                              ],
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

// ═══════════════════════════════════════════════════════════════════
  //  Bottom Section: Listen/Speak cards OR Listening/Evaluating/Results
  // ═══════════════════════════════════════════════════════════════════

  Widget _buildInteractiveBottomSection() {
    // ── Evaluating state ──
    if (_isEvaluating) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(28),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF1E3A8A).withOpacity(0.1),
              blurRadius: 20,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          children: [
            const CircularProgressIndicator(
              color: Color(0xFF7C5CFC),
              strokeWidth: 3,
            ),
            const SizedBox(height: 16),
            Text(
              "Evaluating Speech...",
              style: GoogleFonts.outfit(
                color: const Color(0xFF1E3A8A),
                fontSize: 16,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              "Please wait a moment",
              style: GoogleFonts.outfit(
                color: const Color(0xFF9CA3AF),
                fontSize: 12,
              ),
            ),
          ],
        ),
      );
    }

    // ── Results state ──
    if (_evalResult != null) {
      final bool passed = _evalResult!['passed'];
      final double score = _evalResult!['accuracy'];
      final String feedback = _evalResult!['feedback'];

      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(22),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: passed ? const Color(0xFF10B981) : const Color(0xFFF43F5E),
            width: 2,
          ),
          boxShadow: [
            BoxShadow(
              color: (passed ? const Color(0xFF10B981) : const Color(0xFFF43F5E))
                  .withOpacity(0.12),
              blurRadius: 20,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  passed ? Icons.check_circle_rounded : Icons.cancel_rounded,
                  color: passed ? const Color(0xFF10B981) : const Color(0xFFF43F5E),
                  size: 30,
                ),
                const SizedBox(width: 10),
                Text(
                  passed ? "GREAT JOB!" : "TRY AGAIN!",
                  style: GoogleFonts.outfit(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: passed ? const Color(0xFF10B981) : const Color(0xFFF43F5E),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              "Match Score: ${score.toStringAsFixed(1)}%",
              style: GoogleFonts.outfit(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: const Color(0xFF1E3A8A),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              feedback,
              textAlign: TextAlign.center,
              style: GoogleFonts.outfit(fontSize: 13, color: const Color(0xFF9CA3AF)),
            ),
            const SizedBox(height: 18),

            if (passed)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                  onPressed: _handleNextAlphabet,
                  icon: const Icon(Icons.arrow_forward_rounded, color: Colors.white),
                  label: Text(
                    _isNumbersMode ? "NEXT NUMBER ➔" : "NEXT LETTER ➔",
                    style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ),
              )
            else
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF7C5CFC),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                  onPressed: () => _speakPhoneticSound3Times(),
                  icon: const Icon(Icons.replay_rounded, color: Colors.white),
                  label: Text(
                    "TRY AGAIN 🔄",
                    style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ),
              ),
          ],
        ),
      );
    }

    // ── Listening state ──
    if (_isListeningWindow) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(22),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0xFF1E3A8A).withOpacity(0.3), width: 2),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF1E3A8A).withOpacity(0.08),
              blurRadius: 20,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.mic_rounded, color: Color(0xFF7C5CFC), size: 22),
                const SizedBox(width: 8),
                Text(
                  "Listening... say \"${_currentAlphabet.word}\"",
                  style: GoogleFonts.outfit(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF1E3A8A),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: _timeLeft / 12,
                backgroundColor: const Color(0xFFE2E8F0),
                color: const Color(0xFF1E3A8A),
                minHeight: 6,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              "${_timeLeft}s remaining",
              style: GoogleFonts.outfit(color: const Color(0xFF9CA3AF), fontSize: 12),
            ),
            const SizedBox(height: 16),

            ScaleTransition(
              scale: _pulseAnimation,
              child: GestureDetector(
                onTap: _finishDetectionWindow,
                child: Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: _voiceDetected ? const Color(0xFF10B981) : const Color(0xFF7C5CFC),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: (_voiceDetected
                                ? const Color(0xFF10B981)
                                : const Color(0xFF7C5CFC))
                            .withOpacity(0.3),
                        blurRadius: 18,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: Icon(
                    _voiceDetected ? Icons.graphic_eq_rounded : Icons.mic_rounded,
                    color: Colors.white,
                    size: 32,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 10),
            Text(
              (_voiceDetected || _recognizedWords.trim().isNotEmpty)
                  ? "Voice Heard! Recording... 🎤"
                  : "Waiting for your voice...",
              style: GoogleFonts.outfit(
                color: (_voiceDetected || _recognizedWords.trim().isNotEmpty)
                    ? const Color(0xFF10B981)
                    : const Color(0xFF9CA3AF),
                fontSize: 13,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      );
    }

    // ── Default / Ready state: Listen + Speak cards ──
    return Row(
      children: [
        // Listen Card
        Expanded(
          child: GestureDetector(
            onTap: () {
              if (!_isSpeaking3x && !_isListeningWindow && !_isEvaluating) {
                _speakPhoneticSound3Times();
              }
            },
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 26, horizontal: 14),
              decoration: BoxDecoration(
                color: const Color(0xFFF0EAFF),
                borderRadius: BorderRadius.circular(22),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF1E3A8A).withOpacity(0.08),
                    blurRadius: 14,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E3A8A).withOpacity(0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.hearing_rounded, color: Color(0xFF7C5CFC), size: 30),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    "Listen",
                    style: GoogleFonts.outfit(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                      color: const Color(0xFF1E3A8A),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    "Listen to the sound",
                    textAlign: TextAlign.center,
                    style: GoogleFonts.outfit(
                      fontSize: 11,
                      color: const Color(0xFF1E3A8A).withOpacity(0.65),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),

        const SizedBox(width: 14),

        // Speak Card
        Expanded(
          child: GestureDetector(
            onTap: () {
              if (_isReadyToSpeak) {
                _startDetectionWindow();
              } else if (!_isSpeaking3x && !_isListeningWindow && !_isEvaluating) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      'Tap "Listen" first to hear the sound!',
                      style: GoogleFonts.outfit(fontWeight: FontWeight.w600),
                    ),
                    backgroundColor: const Color(0xFF7C5CFC),
                    duration: const Duration(seconds: 2),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    behavior: SnackBarBehavior.floating,
                    margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  ),
                );
              }
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              padding: const EdgeInsets.symmetric(vertical: 26, horizontal: 14),
              decoration: BoxDecoration(
                color: const Color(0xFFE8FFF5),
                borderRadius: BorderRadius.circular(22),
                border: _isReadyToSpeak
                    ? Border.all(color: const Color(0xFF10B981), width: 2.5)
                    : null,
                boxShadow: [
                  BoxShadow(
                    color: _isReadyToSpeak
                        ? const Color(0xFF10B981).withOpacity(0.22)
                        : const Color(0xFF10B981).withOpacity(0.08),
                    blurRadius: _isReadyToSpeak ? 18 : 14,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withOpacity(0.15),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.mic_rounded,
                      color: _isReadyToSpeak
                          ? const Color(0xFF10B981)
                          : const Color(0xFF10B981).withOpacity(0.45),
                      size: 30,
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    "Speak",
                    style: GoogleFonts.outfit(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                      color: _isReadyToSpeak
                          ? const Color(0xFF10B981)
                          : const Color(0xFF10B981).withOpacity(0.45),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    "Tap to record your voice",
                    textAlign: TextAlign.center,
                    style: GoogleFonts.outfit(
                      fontSize: 11,
                      color: const Color(0xFF10B981).withOpacity(0.6),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
