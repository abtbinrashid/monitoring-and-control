/* ==========================================================================
   lang.js — every word on the site, in English and Arabic.

   The Arabic is written to be read, not transliterated: the same points and
   the same definitions, in the register an Arabic reader would expect. Model
   names, trademarks and the pseudo-filenames in the title bars stay as they
   are, because they are names rather than words.

   Nothing here touches the DOM. The pages ask for a string and redraw.
   ========================================================================== */

export const DIR = { en: "ltr", ar: "rtl" };

/* ------------------------------------------------------------ interface */
export const UI = {
  en: {
    title:        "Monitor or control? — S 580 sensors",
    htmlLang:     "en",
    switchTo:     "ع",
    switchLabel:  "العربية — switch to Arabic",

    loading:      "Loading model",
    preparing:    "Preparing model",
    ready:        "Ready",
    retrying:     "Connection dropped, retrying",
    failTitle:    "Could not download the model",
    failBody:     "The connection dropped partway through the 2.9&nbsp;MB download. " +
                  "This usually means a slow or unstable network rather than a problem with the page.",
    failRetry:    "Try again",
    missingTitle: "No model found",
    missingBody:  "Save a car model as <code>assets/models/car.glb</code>, then reload. " +
                  "See <code>README.md</code>.",

    backlink:     "← JUST THE MODEL",
    topicsFile:   "(TOPICS)",
    topicControl: "Control systems",
    topicMonitor: "Monitor systems",
    topicFeedback:"The importance of feedback",
    topicsAria:   "Key ideas",
    guideFile:    "(START.HERE)",
    progFile:     "(SENSORS.CTL)",

    step1:        'Read <b>Control systems</b> and <b>Monitor systems</b>',
    step2:        "Complete the quiz",
    stepDone:     "Done.",
    stepNext:     "Do this next.",
    quizCount:    (d, n) => ` — ${d}/${n} done`,
    nowRead:      "Open 01 and 02 below.",
    nowQuiz:      "Click a numbered sensor on the car.",
    nowDone:      "Both done. Nice.",

    heading:      "Monitor or control?",
    lead:         "Click a numbered sensor on the car, read how it works, then decide which kind of system it is.",
    completed:    (d, n) => `${d}/${n} completed`,
    correctCount: n => `${n} correct`,

    sensorOf:     (i, n) => `Sensor ${i} of ${n}`,
    descFile:     "DESCRIPTION.TXT",
    readOnly:     "(Read-only)",
    question:     "Is this a monitoring system or a control system?",
    monitor:      "Monitor",
    control:      "Control",
    correct:      "Correct",
    incorrect:    "Incorrect",
    isCorrect:    v => `${v} is correct`,
    verdict:      (ok, kind, d, n) =>
                    `${ok ? "Correct" : "Incorrect"}: this is a ${kind} system. ${d}/${n} completed.`,
    kindMonitor:  "monitoring",
    kindControl:  "control",

    resultsFile:  "RESULTS.TXT",
    score:        (r, n) => `You classified ${r} of ${n} sensors correctly.`,
    restart:      "Start again",

    dragMe:       "DRAG ME",
    close:        "Close",
    modelLabel:   "Model:",
    builtBy:      "Built by",
    cutaway:      "Cutaway",
    cutawayAria:  "Cutaway depth",
    navSensors:   "Sensors & systems",
    navModel:     "Model",
    modelTitle:   "Car model",
    credit:       'This work is based on <a href="https://sketchfab.com/3d-models/mercedes-benz-s-580-maybach-w223-6125a32ee10048ca96eee0c28b9c8b6c">&ldquo;Mercedes-Benz S 580 Maybach (W223)&rdquo;</a> by <a href="https://sketchfab.com/Car2022">GT Cars: Hyperspeed</a>, licensed under <a href="https://creativecommons.org/licenses/by/4.0/">CC&nbsp;BY&nbsp;4.0</a>.'
  },

  ar: {
    title:        "مراقبة أم تحكّم؟ — حسّاسات S 580",
    htmlLang:     "ar",
    switchTo:     "EN",
    switchLabel:  "Switch to English",

    loading:      "جارٍ تحميل النموذج",
    preparing:    "جارٍ تجهيز النموذج",
    ready:        "جاهز",
    retrying:     "انقطع الاتصال، نعيد المحاولة",
    failTitle:    "تعذّر تحميل النموذج",
    failBody:     "انقطع الاتصال في منتصف التحميل (2.9&nbsp;ميغابايت). غالبًا السبب " +
                  "شبكة بطيئة أو غير ثابتة، وليست مشكلة في الصفحة.",
    failRetry:    "حاول مرّة أخرى",
    missingTitle: "لا يوجد نموذج",
    missingBody:  "احفظ نموذج السيارة باسم <code>assets/models/car.glb</code> وأعد تحميل الصفحة. " +
                  "التفاصيل في <code>README.md</code>.",

    backlink:     "النموذج وحده \u2192",
    topicsFile:   "(المواضيع)",
    topicControl: "أنظمة التحكّم",
    topicMonitor: "أنظمة المراقبة",
    topicFeedback:"أهمية التغذية الراجعة",
    topicsAria:   "الأفكار الأساسية",
    guideFile:    "(ابدأ.من.هنا)",
    progFile:     "(الحسّاسات)",

    step1:        'اقرأ <b>أنظمة التحكّم</b> و<b>أنظمة المراقبة</b>',
    step2:        "حلّ الاختبار",
    stepDone:     "تمّت.",
    stepNext:     "خطوتك التالية.",
    quizCount:    (d, n) => ` \u2014 ${d}/${n}`,
    nowRead:      "افتح 01 و02 بالأسفل.",
    nowQuiz:      "اضغط على أي رقم على السيارة.",
    nowDone:      "أنهيت الخطوتين. ممتاز.",

    heading:      "مراقبة أم تحكّم؟",
    lead:         "اضغط على أي رقم على السيارة، اقرأ كيف يعمل الحسّاس، ثم قرّر: مراقبة أم تحكّم؟",
    completed:    (d, n) => `${d}/${n} مكتملة`,
    correctCount: n => `${n} صح`,

    sensorOf:     (i, n) => `الحسّاس ${i} من ${n}`,
    descFile:     "الشرح.TXT",
    readOnly:     "(للقراءة فقط)",
    question:     "هذا نظام مراقبة أم نظام تحكّم؟",
    monitor:      "مراقبة",
    control:      "تحكّم",
    correct:      "صح",
    incorrect:    "غلط",
    isCorrect:    v => `الصح: ${v}`,
    verdict:      (ok, kind, d, n) =>
                    `${ok ? "صح" : "غلط"}: هذا نظام ${kind}. ${d}/${n} مكتملة.`,
    kindMonitor:  "مراقبة",
    kindControl:  "تحكّم",

    resultsFile:  "النتيجة.TXT",
    score:        (r, n) => `أجبت صح عن ${r} من ${n} حسّاسات.`,
    restart:      "من البداية",

    dragMe:       "اسحبني",
    close:        "إغلاق",
    modelLabel:   "النموذج:",
    builtBy:      "من إعداد",
    cutaway:      "مقطع جانبي",
    cutawayAria:  "عمق المقطع",
    navSensors:   "الحسّاسات والأنظمة",
    navModel:     "النموذج",
    modelTitle:   "نموذج السيارة",
    credit:       'هذا العمل مبني على <a href="https://sketchfab.com/3d-models/mercedes-benz-s-580-maybach-w223-6125a32ee10048ca96eee0c28b9c8b6c">&ldquo;Mercedes-Benz S 580 Maybach (W223)&rdquo;</a> من <a href="https://sketchfab.com/Car2022">GT Cars: Hyperspeed</a>، برخصة <a href="https://creativecommons.org/licenses/by/4.0/">CC&nbsp;BY&nbsp;4.0</a>.'
  }

};

/* -------------------------------------------------------------- sensors */
/* Same eight sensors, same order as SENSORS in sensors.js. */
export const SENSOR_TEXT = {
  en: [
    { name: "Acoustic Sensor",
      text: `ACTIVE BODY CONTROL(™) uses Acoustic and Ultrasound sensors mounted on the front of the vehicle that emit continuous high-frequency sound pulses (ultrasound) angled downward at the road surface ahead, then based on the data received, the microprocessor adjusts the AIRMATIC AIR Suspension to make you feel like you're driving on a "cloud".` },
    { name: "Infrared Sensor",
      text: `a sunload sensor(a specific type of Infra-red Sensor) mounted on top of the windows continuously measure the intensity of infra-red radiation from the sun entering through the glass, An Analogue-to-Digital Converter (ADC) translates this voltage into a digital value that the computer can process which it then uses to actively tint the windows and block the heat before it even gets in.` },
    { name: "Light Sensor",
      text: `ADAPTIVE HIGHBEAM ASSIST(™) uses one sophisticated light sensor that measures the lux(lumens per square meters) of the surrounding area, It continuously scans the road ahead, capturing frames of light data, It analyzes the data against its programmed parameters to differentiate between a streetlamp, a reflection, and an actual vehicle. and when it Identifies that the cluster of light is a car, it calculates exactly where that car is within its field of view. it then uses an actuator to turn off specific LED diodes inside the headlight assembly. This casts a dark "shadow" perfectly over the oncoming car, while keeping the high beam fully turned on everywhere else around it. Insane.` },
    { name: "Motion Sensor",
      text: `the Mercedes S 580 Maybach uses an Ultrasonic Motion Sensor embedded in the ceiling that is used in the car alarm system: When the car is locked, the ultrasonic transmitter fills the cabin with high-frequency sound waves (inaudible to humans) the receiver then picks up the continuous echo pattern, and the ADC converts it to digital data. The microprocessor establishes a baseline "standing wave" pattern for the empty car. If an intruder smashes a window and reaches inside, their moving arm disrupts the sound waves, changing the frequency of the returning echo. it then  sends an immediate signal to the alarm siren (to make noise), the headlights/indicators (to flash), and the engine immobilizer (to prevent the car from starting).` },
    { name: "Temperature Sensor",
      text: `A thermistor(Temperature sensor) continuously monitors the ambient temperature of the air inside the cabin, As the temperature changes, the voltage passing through the thermistor changes. This is an analog signal. The Analogue-to-Digital Converter (ADC) translates this varying voltage into a digital numerical value. which is then shown to the driver on the infotainment display` },
    { name: "humidity Sensor",
      text: `A humidity sensor mounted on the front bumper continuously measures the water vapor concentration in the outside air. As external moisture levels rise, the sensor generates a varying analog voltage. An Analogue-to-Digital Converter (ADC) translates this voltage into a digital humidity percentage. The vehicle's microprocessor continuously reads this digital data and compares it against a pre-set threshold (e.g., 95% relative humidity, indicating conditions for dense fog). Once the incoming data exceeds this threshold, the microprocessor sends a signal to the headlight actuators, automatically turning on the front fog lights to improve driver visibility, though this model may not have them.` },
    { name: "Pressure Sensor",
      text: `A pressure sensor (typically a piezoelectric sensor) is mounted inside each tire, it continuously measures the physical air pressure inside each tire, As the tire pressure increases or decreases, the sensor produces a varying analog electrical signal (voltage) that corresponds to the physical pressure. an ADC is used to convert it into digital data, which is then shown to the driver on the dashboard, This car though has a feature that compares the value to preset baseline values(e.g 32PSI), if the value deviates from the baseline, it outputs a warning on the dashboard.` },
    { name: "Magnetic Field Sensor",
      text: `Unlike the name suggests this magnetic sensor doesn't measure "magnets" directly—it uses a magnetic field to measure the speed of the rotating wheel.  Think of the ABS magnetic sensor like a high-speed digital counter for your tire. A metal ring with teeth is attached to your wheel hub, spinning right next to a magnetic sensor. As the wheel turns, every passing tooth interrupts the magnetic field and creates a quick analog electrical pulse. An Analogue-to-Digital Converter (ADC) instantly turns these continuous pulses into digital data, letting the car's microprocessor calculate exactly how fast the tire is spinning based on the pulse frequency. If you slam the brakes and the microprocessor sees the digital pulses from one wheel suddenly drop to zero, it knows that tire is locked up and skidding. It immediately triggers the hydraulic actuators to rapidly pump the brake fluid to that specific wheel, unlocking the tire so you can stop safely without losing steering control.` }
  ],

  ar: [
    { name: "حسّاس صوتي",
      text: `في مقدّمة السيارة حسّاسات صوتية وفوق صوتية تابعة لنظام ACTIVE BODY CONTROL™. ترسل نبضات صوتية عالية التردّد باتجاه الطريق أمام السيارة بلا توقّف، وتستقبل ما يرتدّ منها. من هذه البيانات يعرف المعالج شكل الطريق قبل أن تصل إليه العجلات، فيضبط تعليق AIRMATIC الهوائي مسبقًا. النتيجة أنك تشعر وكأنك تمشي فوق سحابة.` },
    { name: "حسّاس أشعة تحت حمراء",
      text: `فوق النوافذ حسّاس اسمه حسّاس حِمل الشمس، وهو نوع من حسّاسات الأشعة تحت الحمراء. وظيفته أن يقيس باستمرار قوّة أشعة الشمس الداخلة من الزجاج. الإشارة الخارجة منه تناظرية، فيحوّلها الـ ADC إلى رقم يفهمه الحاسوب. وبهذا الرقم يعتّم النظام الزجاج تلقائيًا ويمنع الحرارة قبل أن تدخل أصلًا.` },
    { name: "حسّاس ضوء",
      text: `نظام ADAPTIVE HIGHBEAM ASSIST™ يعتمد على حسّاس ضوء واحد دقيق يقيس شدّة الإضاءة حوله باللوكس (لومن لكل متر مربّع). يصوّر الطريق أمامه باستمرار ويحلّل الضوء ليفرّق: هل هذا عمود إنارة، أم مجرّد انعكاس، أم سيارة قادمة؟ وإذا تأكّد أنها سيارة، يحسب مكانها بالضبط، ثم يرسل أمرًا لمُشغّل يطفئ ثنائيات LED معيّنة داخل المصباح وحدها. فيصير هناك ظلّ مظلم فوق السيارة القادمة فقط، والضوء العالي ما زال شغّالًا في كل ما حولها. فكرة ذكية فعلًا.` },
    { name: "حسّاس حركة",
      text: `في سقف المقصورة حسّاس حركة فوق صوتي يشتغل مع نظام الإنذار. ما إن تُقفل السيارة يملأ المرسل المقصورة بموجات صوتية عالية التردّد لا نسمعها، ويلتقط المستقبل صداها، ويحوّله الـ ADC إلى بيانات رقمية. المعالج يحفظ شكل الصدى والسيارة فارغة، ويجعله مرجعًا. فإذا كسر أحدهم النافذة ومدّ يده للداخل، تتغيّر الموجات ويتغيّر الصدى العائد، فيرسل المعالج إشارة فورية: الصفّارة تصرخ، والأضواء تومض، ومانع التشغيل يقفل المحرّك فلا تستطيع السيارة التحرّك.` },
    { name: "حسّاس حرارة",
      text: `الثرمستور حسّاس حرارة يقيس حرارة الهواء داخل المقصورة باستمرار. كلّما تغيّرت الحرارة يتغيّر الجهد المارّ فيه، وهذه إشارة تناظرية. يحوّلها الـ ADC إلى رقم، والرقم يظهر للسائق على شاشة المعلومات والترفيه. هذا كل شيء: النظام يعرض الرقم فقط، ولا يغيّر الحرارة.` },
    { name: "حسّاس رطوبة",
      text: `حسّاس الرطوبة مثبّت في المصدّ الأمامي، ويقيس كمية بخار الماء في الهواء بالخارج. كلّما زادت الرطوبة تغيّر الجهد الخارج منه، ويحوّله الـ ADC إلى نسبة رقمية. المعالج يقارن النسبة بحدّ محفوظ عنده (مثلًا 95% رطوبة نسبية، أي ضباب كثيف). وإذا تجاوزت القراءة هذا الحدّ، يرسل إشارة لمُشغّلات المصابيح فتشتغل أضواء الضباب الأمامية وحدها وتحسّن الرؤية — مع أن هذا الطراز قد لا يملك أضواء ضباب.` },
    { name: "حسّاس ضغط",
      text: `داخل كل إطار حسّاس ضغط، غالبًا من النوع الكهروإجهادي، يقيس ضغط الهواء باستمرار. إذا زاد الضغط أو نقص تتغيّر الإشارة الكهربائية الخارجة منه، ويحوّلها الـ ADC إلى رقم يظهر للسائق على لوحة العدادات. وفي هذه السيارة شيء إضافي: النظام يقارن الرقم بقيمة مرجعية محفوظة (32 PSI مثلًا)، وإذا ابتعد عنها يظهر تحذير على اللوحة.` },
    { name: "حسّاس مجال مغناطيسي",
      text: `الاسم قد يضلّلك: هو ما يقيس المغانط، بل يستعمل مجالًا مغناطيسيًا ليقيس سرعة دوران العجلة. تخيّله عدّادًا سريعًا جدًا: فيه حلقة معدنية مسنّنة تدور مع العجلة بجانب الحسّاس، وكل سنّ يمرّ يقطع المجال المغناطيسي ويولّد نبضة كهربائية صغيرة. يحوّل الـ ADC هذه النبضات إلى بيانات رقمية فورًا، والمعالج يحسب سرعة العجلة من عدد النبضات في الثانية. فإذا ضغطت الفرامل بكل قوّتك ورأى المعالج نبضات عجلة تهبط فجأة إلى صفر، يعرف أنها انغلقت وصارت تنزلق، فيأمر المشغّلات الهيدروليكية بأن تضخّ سائل الفرامل ضخًّا متقطّعًا سريعًا على تلك العجلة وحدها حتى تفكّ وتعود تدور — فتقف بأمان ويبقى التوجيه في يدك.` }
  ]
};

/* ------------------------------------------------------- explainer panels */
/* The two definitions are the course's own wording, so the Arabic says the
   same thing with nothing added and nothing dropped. */
export const CONCEPTS = {
  en: {
    defnWord: "Definition",
    process:  "THE PROCESS",
    control: {
      file: "CONTROL.DOC", title: "Control systems",
      label: "CONTROL SYSTEM",
      defn: "A type of system where sensors feed data to a microprocessor, which compares it against present target values and uses actuators to change the physical conditions.",
      nodes: [
        ["Sensor", "measures the physical", "condition continuously"],
        ["ADC", "converts the analogue", "signal to digital"],
        ["Microprocessor", "compares the reading", "with the target value"],
        ["DAC", "converts the decision", "back to analogue"],
        ["Actuator", "changes the physical", "condition"]
      ],
      loop: "the change is measured again",
      alt: "control system process",
      prose: "The actuator is what makes it a control system. Because the actuator changes the very thing the sensor is measuring, the next reading is a consequence of the last action, so the loop closes and the system corrects itself without a person."
    },
    monitor: {
      file: "MONITOR.DOC", title: "Monitoring systems",
      label: "MONITOR SYSTEM",
      defn: "A type of system where sensors collect data and log it or trigger an alarm without changing the physical environment.",
      nodes: [
        ["Sensor", "measures the physical", "condition continuously"],
        ["ADC", "converts the analogue", "signal to digital"],
        ["Microprocessor", "records the reading, or", "checks it against a limit"],
        ["Display / alarm", "shows the value or", "raises a warning"],
        ["Person", "decides whether", "to do anything"]
      ],
      loop: "no actuator, so no feedback loop",
      alt: "monitoring system process",
      prose: "Everything up to the microprocessor is identical to a control system. The difference is the end of the chain: there is no actuator, so nothing the system does changes the condition being measured. It reports, and a person decides.",
      note: "A display, a lamp and a buzzer are <strong>output devices</strong>, not actuators. They pass information to a person; they do not change the process."
    },
    feedback: {
      file: "FEEDBACK.DOC", title: "Feedback",
      kicker: "Feedback &middot; feedback loops",
      intro: "Before saying why feedback matters, it has to be clear what feedback actually is.",
      label: "FEEDBACK LOOP",
      defn: "A feedback loop is when a control system uses its output to influence its next input.",
      after: "That is the whole idea. The system acts, the action changes the physical conditions, and the sensor then measures those changed conditions. So the result of one action becomes the input to the next decision.",
      whyHead: "WHY IT MATTERS",
      why: [
        "It lets a system <strong>adjust itself automatically</strong> to stay within set conditions, with nobody watching it.",
        "It lets the system <strong>check whether it is actually working as expected</strong>, rather than assuming that its last action worked."
      ],
      exHead: "AN EXAMPLE FROM THIS CAR",
      example: "The anti-lock braking system is sensor 8. The magnetic field sensor counts how fast the wheel is turning. If the microprocessor sees the wheel suddenly stop while the car is still moving, it knows the tyre has locked and is skidding, so it releases the brake pressure at that wheel. The wheel starts turning again &mdash; and the same sensor measures that straight away. That new reading decides what the system does next, many times a second.",
      nodes: [
        ["Wheel speed sensor", "counts the teeth", "passing the sensor"],
        ["Microprocessor", "compares wheel speed", "with the car's speed"],
        ["Brake valve", "releases or reapplies", "the brake pressure"],
        ["Wheel", "speeds up again", "or slows down"]
      ],
      loop: "the new wheel speed is measured",
      alt: "braking feedback loop",
      tryHead: "TRY BREAKING THE LOOP",
      tryIntro: "The driver is braking as hard as they can. Watch what the feedback loop does with that, and then disconnect it.",
      wheelLabel: "Wheel speed",
      brakeLabel: "Brake pressure",
      gripping: "Gripping &mdash; the wheel is still turning",
      locked: "Locked &mdash; the tyre is skidding and you cannot steer",
      disconnect: "Disconnect the sensor",
      reconnect: "Reconnect the sensor",
      reset: "Reset",
      broken: "loop broken — no new readings",
      warn: "With the sensor disconnected the microprocessor gets no new readings, so it never finds out the wheel has locked and never releases the brake. That is what feedback is protecting against."
    }
  },

  ar: {
    defnWord: "التعريف",
    process:  "كيف تمشي العملية",
    control: {
      file: "CONTROL.DOC", title: "أنظمة التحكّم",
      label: "نظام تحكّم",
      defn: "نظام ترسل فيه الحسّاسات بياناتها إلى المعالج، فيقارنها بالقيم المطلوبة المحفوظة عنده، ثم يشغّل المُشغّلات لتغيّر الوضع الفيزيائي نفسه.",
      nodes: [
        ["الحسّاس", "يقيس الوضع", "باستمرار"],
        ["ADC", "يحوّل الإشارة من", "تناظرية إلى رقمية"],
        ["المعالج", "يقارن القراءة", "بالقيمة المطلوبة"],
        ["DAC", "يحوّل القرار إلى", "إشارة تناظرية"],
        ["المُشغّل", "يغيّر الوضع", "على أرض الواقع"]
      ],
      loop: "ويُقاس الوضع الجديد من جديد",
      alt: "كيف يشتغل نظام التحكّم",
      prose: "المُشغّل هو الفرق كله. لأنه يغيّر نفس الشيء الذي يقيسه الحسّاس، تأتي القراءة التالية وقد تأثّرت بما فعله النظام قبل قليل. هنا تنغلق الحلقة، ويصحّح النظام نفسه بنفسه، دون أن يتدخّل أحد."
    },
    monitor: {
      file: "MONITOR.DOC", title: "أنظمة المراقبة",
      label: "نظام مراقبة",
      defn: "نظام تجمع فيه الحسّاسات البيانات، فيسجّلها أو يطلق إنذارًا، دون أن يغيّر شيئًا في البيئة حوله.",
      nodes: [
        ["الحسّاس", "يقيس الوضع", "باستمرار"],
        ["ADC", "يحوّل الإشارة من", "تناظرية إلى رقمية"],
        ["المعالج", "يسجّل القراءة أو", "يقارنها بحدّ معيّن"],
        ["شاشة / إنذار", "يعرض الرقم أو", "ينبّه بصوت"],
        ["الإنسان", "هو من يقرّر", "يتصرّف أم لا"]
      ],
      loop: "لا يوجد مُشغّل، إذن لا توجد حلقة",
      alt: "كيف يشتغل نظام المراقبة",
      prose: "كل شيء قبل المعالج هو نفسه في النظامين. الفرق في آخر السلسلة: لا يوجد مُشغّل، فلا شيء يغيّر الوضع الذي نقيسه. النظام يخبرك فقط، وأنت من يقرّر.",
      note: "الشاشة والمصباح والصفّارة <strong>أجهزة إخراج</strong>، وليست مُشغّلات: توصّل لك المعلومة، لكنها لا تغيّر العملية نفسها."
    },
    feedback: {
      file: "FEEDBACK.DOC", title: "التغذية الراجعة",
      kicker: "التغذية الراجعة &middot; وحلقاتها",
      intro: "قبل أن نقول لماذا هي مهمّة، لا بدّ أن نعرف ما هي أصلًا.",
      label: "حلقة التغذية الراجعة",
      defn: "حلقة التغذية الراجعة هي أن يستخدم نظام التحكّم ما أخرجه ليؤثّر في القراءة التالية التي تدخله.",
      after: "والفكرة كلها هنا: النظام يتصرّف، وتصرّفه يغيّر الوضع، والحسّاس يقيس الوضع بعد ما تغيّر. أي أن نتيجة الخطوة الأولى تصير هي مدخل القرار الذي بعدها.",
      whyHead: "لماذا هي مهمّة",
      why: [
        "تجعل النظام <strong>يضبط نفسه بنفسه</strong> ويبقى داخل الحدود المطلوبة، وما يحتاج أحد يراقبه.",
        "وتجعله <strong>يتأكّد أن ما فعله نجح فعلًا</strong>، بدل أن يفترض ذلك ويكمل."
      ],
      exHead: "مثال من هذه السيارة",
      example: "نظام الفرامل المانع للانغلاق (ABS) هو الحسّاس رقم 8. الحسّاس يعدّ سرعة دوران العجلة. فإذا توقّفت العجلة فجأة والسيارة ما زالت تسير، يعرف المعالج أن الإطار انغلق وبدأ ينزلق، فيخفّف ضغط الفرامل عنها. ترجع العجلة تدور — ونفس الحسّاس يقيس هذا فورًا. والقراءة الجديدة هي التي تحدّد الخطوة التالية، عشرات المرّات في الثانية الواحدة.",
      nodes: [
        ["حسّاس سرعة العجلة", "يعدّ الأسنان", "التي تمرّ أمامه"],
        ["المعالج", "يقارن سرعة العجلة", "بسرعة السيارة"],
        ["صمّام الفرامل", "يخفّف الضغط", "أو يرجّعه"],
        ["العجلة", "تدور أسرع", "أو تتباطأ"]
      ],
      loop: "وتُقاس سرعة العجلة الجديدة",
      alt: "حلقة التغذية الراجعة في الفرامل",
      tryHead: "جرّب تكسر الحلقة",
      tryIntro: "السائق ضاغط الفرامل بأقصى ما يقدر. انظر ماذا تفعل حلقة التغذية الراجعة، ثم افصلها وانظر الفرق.",
      wheelLabel: "سرعة العجلة",
      brakeLabel: "ضغط الفرامل",
      gripping: "ثابتة &mdash; العجلة ما زالت تدور",
      locked: "انغلقت &mdash; الإطار ينزلق ولا تستطيع التوجيه",
      disconnect: "افصل الحسّاس",
      reconnect: "أعد توصيل الحسّاس",
      reset: "من البداية",
      broken: "الحلقة مقطوعة — ما فيه قراءات جديدة",
      warn: "مع فصل الحسّاس لا تصل المعالج أي قراءة جديدة، فلا يعرف أبدًا أن العجلة انغلقت، ولا يخفّف الفرامل أبدًا. هذا بالضبط ما تحمينا منه التغذية الراجعة."
    }
  }

};

/* --------------------------------------------------------- current state */
const KEY = "mc.lang";
const listeners = [];
let lang = "en";

export function getLang() { return lang; }
export function t() { return UI[lang]; }
export function concepts() { return CONCEPTS[lang]; }
export function sensorText(i) { return SENSOR_TEXT[lang][i]; }

export function onLangChange(fn) { listeners.push(fn); }

export function setLang(next) {
  if (next !== "en" && next !== "ar") return;
  lang = next;
  const html = document.documentElement;
  html.lang = next;
  html.dir = DIR[next];
  document.title = UI[next].title;
  linkLang();
  listeners.forEach(fn => fn(next));
}

/* Arabic carries across the site's own links while you are in it, so the two
   pages do not throw you back into English mid-visit. */
function linkLang() {
  document.querySelectorAll('a[href$=".html"], a[href="./"]').forEach(a => {
    const u = new URL(a.getAttribute("href"), location.href);
    if (lang === "ar") u.searchParams.set("lang", "ar");
    else u.searchParams.delete("lang");
    a.setAttribute("href", u.pathname.split("/").pop() + u.search);
  });
}

/* The site always opens in English, for everybody, every time. Nothing is
   remembered between loads: this is English coursework, and the examiner,
   the teacher and a stranger all have to land on English. Arabic exists for
   whoever is sent ?lang=ar, and for whoever presses the toggle while reading
   — but a reload is a clean slate. */
export function initLang() {
  try { localStorage.removeItem(KEY); } catch (e) { /* private mode */ }
  const q = new URLSearchParams(location.search).get("lang");
  setLang(q === "ar" ? "ar" : "en");
}

/* ------------------------------------------------------------ static DOM */
/* Markup carries data-i18n="key" (text), data-i18n-html (markup) or
   data-i18n-aria (label), so the HTML stays readable and nothing hard-codes
   a second copy of a string. */
export function applyStatic(root = document) {
  const L = UI[lang];
  root.querySelectorAll("[data-i18n]").forEach(el => {
    const v = L[el.dataset.i18n]; if (v != null) el.textContent = v;
  });
  root.querySelectorAll("[data-i18n-html]").forEach(el => {
    const v = L[el.dataset.i18nHtml]; if (v != null) el.innerHTML = v;
  });
  root.querySelectorAll("[data-i18n-aria]").forEach(el => {
    const v = L[el.dataset.i18nAria]; if (v != null) el.setAttribute("aria-label", v);
  });
}

export function wireLangButton() {
  const b = document.getElementById("langBtn");
  if (!b) return;
  const paint = () => {
    b.textContent = UI[lang].switchTo;
    b.setAttribute("aria-label", UI[lang].switchLabel);
    b.lang = lang === "ar" ? "en" : "ar";       /* the label is in the other one */
  };
  b.addEventListener("click", () => setLang(lang === "ar" ? "en" : "ar"));
  onLangChange(paint);
  paint();
}

/* one call for a page that has no other language work to do */
export function mountLang() {
  initLang();
  applyStatic();
  wireLangButton();
  onLangChange(() => applyStatic());
}
