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
    step2:        "Drag the car to look all around it",
    step3:        "Complete the quiz",
    stepDone:     "Done.",
    stepNext:     "Do this next.",
    quizCount:    (d, n) => ` — ${d}/${n} done`,
    nowRead:      "Open 01 and 02 below.",
    nowDrag:      "Drag anywhere on the car to spin it.",
    nowQuiz:      "Click a numbered sensor on the car.",
    nowDone:      "All three done. Nice.",

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
    retrying:     "انقطع الاتصال، تجري إعادة المحاولة",
    failTitle:    "تعذّر تحميل النموذج",
    failBody:     "انقطع الاتصال في منتصف تحميل الـ 2.9&nbsp;ميغابايت. وهذا غالبًا سببه " +
                  "شبكة بطيئة أو غير مستقرّة، لا خلل في الصفحة.",
    failRetry:    "أعد المحاولة",
    missingTitle: "لا يوجد نموذج",
    missingBody:  "احفظ نموذج السيارة باسم <code>assets/models/car.glb</code> ثم أعد تحميل الصفحة. " +
                  "انظر <code>README.md</code>.",

    backlink:     "النموذج وحده →",
    topicsFile:   "(المواضيع)",
    topicControl: "أنظمة التحكّم",
    topicMonitor: "أنظمة المراقبة",
    topicFeedback:"أهمية التغذية الراجعة",
    topicsAria:   "الأفكار الأساسية",
    guideFile:    "(ابدأ.من.هنا)",
    progFile:     "(الحسّاسات)",

    step1:        'اقرأ <b>أنظمة التحكّم</b> و<b>أنظمة المراقبة</b>',
    step2:        "اسحب السيارة لتدور حولها",
    step3:        "أكمل الاختبار",
    stepDone:     "تمّت.",
    stepNext:     "هذه خطوتك التالية.",
    quizCount:    (d, n) => ` — ${d}/${n}`,
    nowRead:      "افتح 01 و02 بالأسفل.",
    nowDrag:      "اسحب أي موضع على السيارة لتديرها.",
    nowQuiz:      "اضغط على حسّاس مرقّم على السيارة.",
    nowDone:      "أنهيت الخطوات الثلاث. أحسنت.",

    heading:      "مراقبة أم تحكّم؟",
    lead:         "اضغط على حسّاس مرقّم على السيارة، واقرأ كيف يعمل، ثم قرّر: أهو نظام مراقبة أم نظام تحكّم؟",
    completed:    (d, n) => `${d}/${n} مكتملة`,
    correctCount: n => `${n} صحيحة`,

    sensorOf:     (i, n) => `الحسّاس ${i} من ${n}`,
    descFile:     "الشرح.TXT",
    readOnly:     "(للقراءة فقط)",
    question:     "أهذا نظام مراقبة أم نظام تحكّم؟",
    monitor:      "مراقبة",
    control:      "تحكّم",
    correct:      "صحيح",
    incorrect:    "خطأ",
    isCorrect:    v => `الصواب: ${v}`,
    verdict:      (ok, kind, d, n) =>
                    `${ok ? "صحيح" : "خطأ"}: هذا نظام ${kind}. ${d}/${n} مكتملة.`,
    kindMonitor:  "مراقبة",
    kindControl:  "تحكّم",

    resultsFile:  "النتيجة.TXT",
    score:        (r, n) => `صنّفت ${r} من ${n} حسّاسات تصنيفًا صحيحًا.`,
    restart:      "ابدأ من جديد",

    dragMe:       "اسحبني",
    close:        "إغلاق",
    modelLabel:   "النموذج:",
    builtBy:      "إعداد",
    cutaway:      "مقطع عرضي",
    cutawayAria:  "عمق المقطع",
    navSensors:   "الحسّاسات والأنظمة",
    navModel:     "النموذج",
    modelTitle:   "نموذج السيارة",
    credit:       'هذا العمل مبني على <a href="https://sketchfab.com/3d-models/mercedes-benz-s-580-maybach-w223-6125a32ee10048ca96eee0c28b9c8b6c">&ldquo;Mercedes-Benz S 580 Maybach (W223)&rdquo;</a> من <a href="https://sketchfab.com/Car2022">GT Cars: Hyperspeed</a>، بترخيص <a href="https://creativecommons.org/licenses/by/4.0/">CC&nbsp;BY&nbsp;4.0</a>.'
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
      text: `يعتمد نظام ACTIVE BODY CONTROL™ على حسّاسات صوتية وفوق صوتية مثبّتة في مقدّمة السيارة، تُطلق نبضات صوتية عالية التردّد بلا انقطاع، مصوَّبة إلى أسفل نحو سطح الطريق أمامها. ومن البيانات العائدة إليه يضبط المعالج الدقيق نظام التعليق الهوائي AIRMATIC، فتشعر وكأنك تقود فوق «سحابة».` },
    { name: "حسّاس أشعة تحت حمراء",
      text: `حسّاس حِمل الشمس (نوع خاص من حسّاسات الأشعة تحت الحمراء) مثبّت أعلى النوافذ، يقيس باستمرار شدّة الأشعة تحت الحمراء القادمة من الشمس عبر الزجاج. ويترجم مُحوِّل التناظري إلى الرقمي (ADC) هذا الجهد إلى قيمة رقمية يستطيع الحاسوب معالجتها، فيستخدمها لتعتيم النوافذ تعتيمًا نشطًا وحجب الحرارة قبل أن تدخل أصلًا.` },
    { name: "حسّاس ضوء",
      text: `يستخدم نظام ADAPTIVE HIGHBEAM ASSIST™ حسّاس ضوء واحدًا بالغ الدقّة يقيس شدّة الإضاءة (باللوكس: لومن لكل متر مربّع) في محيطه. يمسح الطريق أمامه بلا توقّف ويلتقط إطارات متتابعة من بيانات الضوء، ثم يحلّلها وفق معايير مبرمَجة ليفرّق بين عمود إنارة، وانعكاس، وسيارة حقيقية. وحين يتبيّن أن تجمّع الضوء سيارةٌ قادمة، يحسب موضعها بالضبط داخل مجال رؤيته، ثم يأمر مُشغّلًا بإطفاء ثنائيات LED بعينها داخل المصباح الأمامي. فيُلقي «ظلًّا» مظلمًا يغطّي السيارة القادمة وحدها تغطية تامّة، بينما يبقى الضوء العالي مشتعلًا في كل ما حولها. مذهل.` },
    { name: "حسّاس حركة",
      text: `تستخدم مرسيدس S 580 مايباخ حسّاس حركة فوق صوتيًّا مدمجًا في السقف، يعمل ضمن منظومة الإنذار: حين تُقفَل السيارة يملأ المُرسِل المقصورة بموجات صوتية عالية التردّد لا تسمعها الأذن البشرية، فيلتقط المستقبِل نمط الصدى المتّصل، ويحوّله الـ ADC إلى بيانات رقمية. يثبّت المعالج الدقيق نمطًا مرجعيًّا «لموجة ساكنة» للسيارة وهي فارغة. فإذا حطّم متسلّلٌ نافذةً ومدّ ذراعه إلى الداخل، شوّشت حركة ذراعه الموجاتِ وغيّرت تردّد الصدى العائد، فيرسل المعالج إشارة فورية إلى صفّارة الإنذار لتُطلق صوتها، وإلى المصابيح والإشارات لتومض، وإلى مانع تشغيل المحرّك ليحول دون انطلاق السيارة.` },
    { name: "حسّاس حرارة",
      text: `يراقب المقياس الحراري (الثرمستور) درجة حرارة الهواء داخل المقصورة مراقبةً مستمرّة. ومع تغيّر الحرارة يتغيّر الجهد المارّ عبر الثرمستور، وهذه إشارة تناظرية. يترجم مُحوِّل التناظري إلى الرقمي (ADC) هذا الجهد المتغيّر إلى قيمة رقمية، ثم تُعرض على السائق على شاشة نظام المعلومات والترفيه.` },
    { name: "حسّاس رطوبة",
      text: `حسّاس رطوبة مثبّت في المصدّ الأمامي يقيس باستمرار تركيز بخار الماء في الهواء الخارجي. وكلّما ارتفعت نسبة الرطوبة في الخارج ولّد الحسّاس جهدًا تناظريًّا متغيّرًا، يترجمه مُحوِّل التناظري إلى الرقمي (ADC) إلى نسبة رطوبة رقمية. يقرأ معالج السيارة الدقيق هذه البيانات باستمرار ويقارنها بعتبة مضبوطة مسبقًا (مثلًا 95% رطوبة نسبية، وهي حال الضباب الكثيف). وما إن تتجاوز القراءةُ تلك العتبةَ حتى يرسل المعالج إشارة إلى مُشغّلات المصابيح، فتشتعل أضواء الضباب الأمامية تلقائيًّا لتحسين رؤية السائق، وإن كان هذا الطراز قد لا يملكها.` },
    { name: "حسّاس ضغط",
      text: `داخل كل إطار حسّاس ضغط (كهروإجهادي عادةً) يقيس ضغط الهواء فيه قياسًا مستمرًّا. ومع ارتفاع ضغط الإطار أو انخفاضه يعطي الحسّاس إشارة كهربائية تناظرية متغيّرة تقابل الضغط الفعلي، ويحوّلها الـ ADC إلى بيانات رقمية تُعرض للسائق على لوحة العدادات. على أن في هذه السيارة ميزة إضافية: تقارن القيمة بقيم مرجعية مضبوطة مسبقًا (32 رطلًا على البوصة المربّعة مثلًا)، فإن انحرفت القراءة عن المرجع أظهرت تحذيرًا على اللوحة.` },
    { name: "حسّاس مجال مغناطيسي",
      text: `خلافًا لما يوحي به اسمه، لا يقيس هذا الحسّاس المغناطيسي «المغانط» مباشرة، بل يستعين بمجال مغناطيسي ليقيس سرعة دوران العجلة. تخيّل حسّاس الـ ABS المغناطيسي عدّادًا رقميًّا فائق السرعة لإطارك: حلقة معدنية مسنّنة مثبّتة على صُرّة العجلة تدور بمحاذاة الحسّاس تمامًا، وكلّما مرّ سنٌّ قطع المجال المغناطيسي فولّد نبضة كهربائية تناظرية خاطفة. ويحوّل مُحوِّل التناظري إلى الرقمي (ADC) هذه النبضات المتّصلة إلى بيانات رقمية في الحال، فيحسب المعالج الدقيق سرعة دوران الإطار من تردّد النبضات. فإذا ضغطت الفرامل بكل قوّتك ورأى المعالج نبضات إحدى العجلات تهبط فجأة إلى الصفر، أدرك أن الإطار انغلق وصار ينزلق، فيأمر المشغّلات الهيدروليكية في اللحظة ذاتها بضخّ سائل الفرامل ضخًّا متقطّعًا سريعًا عند تلك العجلة وحدها، فيفكّ انغلاق الإطار لتتوقّف بأمان دون أن تفقد السيطرة على التوجيه.` }
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
    process:  "سير العملية",
    control: {
      file: "CONTROL.DOC", title: "أنظمة التحكّم",
      label: "نظام تحكّم",
      defn: "نوع من الأنظمة تُغذّي فيه الحسّاسات معالجًا دقيقًا بالبيانات، فيقارنها بالقيم المستهدفة المضبوطة مسبقًا، ويستخدم المُشغّلات لتغيير الظروف الفيزيائية.",
      nodes: [
        ["الحسّاس", "يقيس الحالة الفيزيائية", "قياسًا مستمرًّا"],
        ["ADC", "يحوّل الإشارة التناظرية", "إلى رقمية"],
        ["المعالج الدقيق", "يقارن القراءة", "بالقيمة المستهدفة"],
        ["DAC", "يعيد تحويل القرار", "إلى إشارة تناظرية"],
        ["المُشغّل", "يغيّر الحالة", "الفيزيائية"]
      ],
      loop: "ويُقاس التغيّر من جديد",
      alt: "سير عمل نظام التحكّم",
      prose: "المُشغّل هو ما يجعل النظام نظام تحكّم. فلأنه يغيّر الشيء نفسه الذي يقيسه الحسّاس، تصبح القراءة التالية نتيجةً للفعل السابق، فتنغلق الحلقة ويصحّح النظام نفسه بنفسه دون إنسان."
    },
    monitor: {
      file: "MONITOR.DOC", title: "أنظمة المراقبة",
      label: "نظام مراقبة",
      defn: "نوع من الأنظمة تجمع فيه الحسّاسات البيانات فتسجّلها أو تُطلق إنذارًا، دون أن تغيّر البيئة الفيزيائية.",
      nodes: [
        ["الحسّاس", "يقيس الحالة الفيزيائية", "قياسًا مستمرًّا"],
        ["ADC", "يحوّل الإشارة التناظرية", "إلى رقمية"],
        ["المعالج الدقيق", "يسجّل القراءة أو", "يقارنها بحدّ معيّن"],
        ["شاشة / إنذار", "يعرض القيمة أو", "يطلق تحذيرًا"],
        ["الإنسان", "يقرّر هل يتصرّف", "أم لا"]
      ],
      loop: "لا مُشغّل، فلا حلقة تغذية راجعة",
      alt: "سير عمل نظام المراقبة",
      prose: "كل ما يسبق المعالج الدقيق مطابق لنظام التحكّم تمامًا. الفرق في آخر السلسلة: لا مُشغّل هنا، فليس في ما يفعله النظام شيء يغيّر الحالة التي يقيسها. هو يُبلّغ، والإنسان يقرّر.",
      note: "الشاشة والمصباح والجرس <strong>أجهزة إخراج</strong> لا مُشغّلات: تنقل المعلومة إلى إنسان، ولا تغيّر العملية نفسها."
    },
    feedback: {
      file: "FEEDBACK.DOC", title: "التغذية الراجعة",
      kicker: "التغذية الراجعة &middot; حلقاتها",
      intro: "قبل الكلام في أهمية التغذية الراجعة، لا بدّ أن يتّضح ما هي أصلًا.",
      label: "حلقة التغذية الراجعة",
      defn: "حلقة التغذية الراجعة هي أن يستخدم نظام التحكّم مُخرجاته للتأثير في مُدخلاته التالية.",
      after: "هذه هي الفكرة كلها. يتصرّف النظام، فيغيّر تصرّفُه الظروفَ الفيزيائية، ثم يقيس الحسّاس تلك الظروف بعد أن تغيّرت. فتصير نتيجة الفعل الواحد مُدخلًا للقرار الذي يليه.",
      whyHead: "لماذا تهمّ",
      why: [
        "تتيح للنظام أن <strong>يضبط نفسه تلقائيًّا</strong> ليبقى ضمن الحدود المطلوبة، دون أن يراقبه أحد.",
        "وتتيح له أن <strong>يتحقّق من أنه يعمل فعلًا كما هو متوقّع</strong>، بدل أن يفترض أن فعله الأخير قد نجح."
      ],
      exHead: "مثال من هذه السيارة",
      example: "نظام الفرملة المانع للانغلاق هو الحسّاس رقم 8. يعدّ حسّاس المجال المغناطيسي سرعة دوران العجلة. فإذا رأى المعالج الدقيق العجلة تتوقّف فجأة والسيارة ما زالت تتحرّك، عرف أن الإطار انغلق وصار ينزلق، فيخفّف ضغط الفرامل عند تلك العجلة. تعود العجلة إلى الدوران &mdash; ويقيس الحسّاس نفسه ذلك في الحال. وتقرّر تلك القراءة الجديدة ما يفعله النظام بعدها، عشرات المرّات في الثانية.",
      nodes: [
        ["حسّاس سرعة العجلة", "يعدّ الأسنان", "المارّة أمامه"],
        ["المعالج الدقيق", "يقارن سرعة العجلة", "بسرعة السيارة"],
        ["صمّام الفرامل", "يخفّف ضغط الفرامل", "أو يعيده"],
        ["العجلة", "تعود إلى التسارع", "أو تتباطأ"]
      ],
      loop: "وتُقاس سرعة العجلة الجديدة",
      alt: "حلقة التغذية الراجعة في الفرملة",
      tryHead: "جرّب أن تكسر الحلقة",
      tryIntro: "السائق يضغط الفرامل بأقصى ما يستطيع. راقب ما تصنعه حلقة التغذية الراجعة بذلك، ثم افصلها.",
      wheelLabel: "سرعة العجلة",
      brakeLabel: "ضغط الفرامل",
      gripping: "تماسُك &mdash; العجلة ما زالت تدور",
      locked: "انغلاق &mdash; الإطار ينزلق ولا تستطيع التوجيه",
      disconnect: "افصل الحسّاس",
      reconnect: "أعد توصيل الحسّاس",
      reset: "إعادة الضبط",
      broken: "الحلقة مقطوعة — لا قراءات جديدة",
      warn: "مع فصل الحسّاس لا تصل المعالجَ الدقيق أي قراءات جديدة، فلا يعلم أبدًا أن العجلة انغلقت، ولا يخفّف الفرامل أبدًا. هذا بالضبط ما تحمينا منه التغذية الراجعة."
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

export function setLang(next, remember = true) {
  if (next !== "en" && next !== "ar") return;
  lang = next;
  const html = document.documentElement;
  html.lang = next;
  html.dir = DIR[next];
  document.title = UI[next].title;
  if (remember) { try { localStorage.setItem(KEY, next); } catch (e) { /* private mode */ } }
  listeners.forEach(fn => fn(next));
}

/* English is the default for everyone, every time, whatever the browser is
   set to: this is coursework in English and it has to open in English. Arabic
   is only ever reached by asking for it — ?lang=ar, or the toggle, which is
   then remembered on that device. */
export function initLang() {
  const q = new URLSearchParams(location.search).get("lang");
  let want = null, remember = false;
  if (q === "en" || q === "ar") { want = q; remember = true; }
  if (!want) { try { want = localStorage.getItem(KEY); } catch (e) { want = null; } }
  setLang(want === "ar" ? "ar" : "en", remember);
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
