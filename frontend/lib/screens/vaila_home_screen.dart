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
  const VailaHomeScreen({super.key, this.mode = 'letters'});

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

  bool get _isNumbersMode => widget.mode == 'numbers';
  List<AlphabetItem> get _items => _isNumbersMode ? _numbers : _alphabets;

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
      if (userStr != null) {
        final userObj = jsonDecode(userStr);
        if (userObj['username'] != null && (userObj['username'] as String).isNotEmpty) {
          if (mounted) {
            setState(() {
              _studentName = userObj['username'];
            });
          }
        }
      }
    } catch (e) {
      print('Learner name load notice: $e');
    }
  }

  void _handleLogout() async {
    _cancelTtsLoop = true;
    try { _flutterTts.stop(); } catch (_) {}
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();

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
    await _flutterTts.setLanguage('en-US');
    await _flutterTts.setSpeechRate(0.42);
    await _flutterTts.setPitch(1.25);
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
      'a': 'aaa', 'b': 'buh', 'c': 'kuh', 'd': 'duh', 'e': 'eh',
      'f': 'fff', 'g': 'guh', 'h': 'huh', 'i': 'ih', 'j': 'juh',
      'k': 'kuh', 'l': 'lll', 'm': 'mmm', 'n': 'nnn', 'o': 'oh',
      'p': 'puh', 'q': 'quh', 'r': 'rrr', 's': 'sss', 't': 'tuh',
      'u': 'uh', 'v': 'vvv', 'w': 'wuh', 'x': 'ks', 'y': 'yuh', 'z': 'zzz'
    };
    final letter = _currentAlphabet.letter.toLowerCase();
    final phonic = phoneticMap[letter] ?? letter;
    final word = _currentAlphabet.word;
    final soundToSpeak = _isNumbersMode ? _currentAlphabet.sound : "${letter.toUpperCase()} for $phonic $word";

    for (int i = 0; i < 3; i++) {
      if (_cancelTtsLoop || !mounted) break;
      await _flutterTts.speak(soundToSpeak);
      await Future.delayed(const Duration(milliseconds: 1400));
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
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Camera Mirror (Top Left)
                  GestureDetector(
                    onTap: _toggleCamera,
                    child: Container(
                      width: 90,
                      height: 70,
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
                          height: 80,
                          errorBuilder: (ctx, err, stack) => const Icon(Icons.hearing, color: Color(0xFF1E3A8A), size: 40),
                        ),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E3A8A),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Text(
                            "VSCI&HI",
                            style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          "For Children with Hearing Aid\n& Cochlear Implant",
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 8, color: Colors.grey),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          "VAILA'S Speech\nTrainer",
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Color(0xFF1E3A8A), fontSize: 14, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _isNumbersMode ? "NUMBERS" : "PHONICS",
                          style: const TextStyle(color: Color(0xFFD32F2F), fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                        ),
                        const SizedBox(height: 4),
                        const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.star, color: Colors.amber, size: 12),
                            SizedBox(width: 4),
                            Text(
                              "Inclusive Learning\nFor Every Child",
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Color(0xFF1E3A8A), fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                            SizedBox(width: 4),
                            Icon(Icons.star, color: Colors.amber, size: 12),
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
                    const SizedBox(height: 28),

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

                    // Sound wave icon (green)
                    Icon(
                      Icons.graphic_eq_rounded,
                      color: const Color(0xFFF57C00),
                      size: 30,
                    ),

                    const SizedBox(height: 8),

                    // " " label
                    Text(
                      " ",
                      style: GoogleFonts.outfit(
                        fontSize: 14,
                        color: const Color(0xFF9CA3AF),
                        fontWeight: FontWeight.w500,
                        fontStyle: FontStyle.italic,
                      ),
                    ),

                    const SizedBox(height: 4),

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
                            fontSize: _isNumbersMode ? 90 : 120,
                            fontWeight: FontWeight.w900,
                            color: const Color(0xFF1E3A8A),
                            height: 1.15,
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 6),

                    // Subtitle
                    Text(
                      "${_currentAlphabet.word}",
                      style: GoogleFonts.outfit(
                        fontSize: 18,
                        color: const Color(0xFF9CA3AF),
                        fontWeight: FontWeight.w500,
                      ),
                    ),

                    const SizedBox(height: 30),

                    // ───── Interactive Bottom Section ─────
                    _buildInteractiveBottomSection(),

                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),

            // ───── BOTTOM BAR: Progress ─────
            Container(
              padding: const EdgeInsets.fromLTRB(20, 14, 20, 18),
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
                        Text(
                          "Your Progress",
                          style: GoogleFonts.outfit(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFF64748B),
                          ),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            // Progress dots A–E with connecting lines
                            ...List.generate(_items.length, (index) {
                              final bool isCompleted = index < _currentIndex;
                              final bool isCurrent = index == _currentIndex;
                              final bool isActive = isCompleted || isCurrent;

                              if (_isNumbersMode) {
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
                                      if (isCurrent || index == 0 || index == _items.length - 1)
                                        Column(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Container(
                                              width: isCurrent ? 14 : 8,
                                              height: isCurrent ? 14 : 8,
                                              decoration: BoxDecoration(
                                                shape: BoxShape.circle,
                                                color: isActive
                                                    ? const Color(0xFF1E3A8A)
                                                    : const Color(0xFFE2E8F0),
                                              ),
                                            ),
                                            const SizedBox(height: 3),
                                            if (isCurrent)
                                              Text(
                                                _items[index].letter,
                                                style: GoogleFonts.outfit(
                                                  fontSize: 8,
                                                  fontWeight: FontWeight.w700,
                                                  color: const Color(0xFF1E3A8A),
                                                ),
                                              ),
                                          ],
                                        ),
                                    ],
                                  ),
                                );
                              }

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
                                    Column(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Container(
                                          width: isCurrent ? 16 : 12,
                                          height: isCurrent ? 16 : 12,
                                          decoration: BoxDecoration(
                                            shape: BoxShape.circle,
                                            color: isActive
                                                ? const Color(0xFF1E3A8A)
                                                : const Color(0xFFE2E8F0),
                                          ),
                                        ),
                                        const SizedBox(height: 5),
                                        Text(
                                          _items[index].letter.toUpperCase(),
                                          style: GoogleFonts.outfit(
                                            fontSize: 10,
                                            fontWeight: FontWeight.w700,
                                            color: isActive
                                                ? const Color(0xFF1E3A8A)
                                                : const Color(0xFF9CA3AF),
                                          ),
                                        ),
                                      ],
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
