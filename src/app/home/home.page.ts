import { App } from '@capacitor/app';
import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';

type Screen =
  | 'splash'
  | 'menu'
  | 'subject'
  | 'topics'
  | 'lesson'
  | 'activity'
  | 'quiz'
  | 'result'
  | 'progress'
  | 'studyLater'
  | 'exitPrompt'
  | 'exitThanks';

interface GradeInfo {
  label: string;
  grade: number;
  description: string;
  performanceMessage: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

interface ActivityTask {
  prompt: string;
  options: string[];
  correct: string;
  explanation: string;
}

interface Topic {
  id: string;
  title: string;
  subject: 'Science' | 'Mathematics';
  summary: string;
  description: string;
  introduction: string;
  keyConcepts: string[];
  example: string;
  didYouKnow: string;
  takeaways: string[];
  activity: ActivityTask;
  quiz: QuizQuestion[];
}

interface QuizResult {
  topicId: string;
  title: string;
  subject: 'Science' | 'Mathematics';
  score: number;
  total: number;
  percentage: number;
  grade: number;
  gradeLabel: string;
  description: string;
  performanceMessage: string;
  completedAt: string;
}

interface StudyLaterItem {
  topicId: string;
  title: string;
  subject: 'Science' | 'Mathematics';
  savedAt: string;
}

const STORAGE_KEYS = {
  progress: 'sciexplore-progress-v1',
  studyLater: 'sciexplore-study-later-v1',
};

const TOPICS: Topic[] = [
  {
    id: 'genetics',
    title: 'Genetics',
    subject: 'Science',
    summary: 'Genes carry instructions that help living things grow and function.',
    description:
      'Genetics explores how traits are passed from one generation to another through genes and DNA.',
    introduction:
      'Genetics is the study of inherited traits and the biological instructions that shape how living things develop and function.',
    keyConcepts: [
      'DNA is the molecule that stores genetic information inside the cells of living organisms.',
      'Genes are specific parts of DNA that carry information for traits such as eye color and height.',
      'Parents pass genetic material to their children, which is why many traits are inherited.',
    ],
    example:
      'A child may inherit their eye color, hair texture, or blood type from their parents through genes.',
    didYouKnow:
      'Humans have thousands of genes working together to guide growth, development, and body functions.',
    takeaways: [
      'DNA contains genetic instructions.',
      'Genes influence inherited traits.',
      'Traits are passed from parents to offspring.',
    ],
    activity: {
      prompt: 'Which one is an inherited trait?',
      options: ['Eye color', 'The color of a book', 'A school uniform', 'The weather today'],
      correct: 'Eye color',
      explanation: 'Inherited traits are passed from parents to children through genes.',
    },
    quiz: [
      {
        question: 'What does DNA contain?',
        options: ['Food energy', 'Genetic instructions', 'Sound waves', 'Plant roots'],
        correct: 'Genetic instructions',
        explanation: 'DNA carries the genetic instructions used to build and maintain living things.',
      },
      {
        question: 'Which is an example of an inherited trait?',
        options: ['Blood type', 'Favorite song', 'Laptop brand', 'Daily schedule'],
        correct: 'Blood type',
        explanation: 'Blood type is inherited through genes from parents.',
      },
      {
        question: 'What are genes?',
        options: ['Sections of DNA', 'Types of cells', 'Weather systems', 'Electric currents'],
        correct: 'Sections of DNA',
        explanation: 'Genes are specific sections of DNA that influence traits and functions.',
      },
    ],
  },
  {
    id: 'ecosystems',
    title: 'Ecosystems',
    subject: 'Science',
    summary: 'An ecosystem is a community of living things interacting with their environment.',
    description:
      'Ecosystems include plants, animals, microorganisms, water, soil, and air. They work together in balance.',
    introduction:
      'An ecosystem is a system where living things interact with each other and with their non-living environment.',
    keyConcepts: [
      'Producers such as plants make their own food using sunlight.',
      'Consumers depend on other organisms for energy and nutrients.',
      'Decomposers break down dead matter and return nutrients to the soil.',
    ],
    example:
      'A pond ecosystem contains fish, frogs, algae, insects, and water plants that interact with one another.',
    didYouKnow:
      'Healthy ecosystems depend on balanced food chains, water, sunlight, and nutrients in the environment.',
    takeaways: [
      'Ecosystems involve living and non-living parts.',
      'Different organisms depend on each other.',
      'Balance is essential for a healthy ecosystem.',
    ],
    activity: {
      prompt: 'Which organism is a producer?',
      options: ['Grass', 'Lion', 'Rabbit', 'Bird'],
      correct: 'Grass',
      explanation: 'Producers like plants make their own food using sunlight.',
    },
    quiz: [
      {
        question: 'What is a producer in an ecosystem?',
        options: ['An animal that hunts other animals', 'A plant that makes its own food', 'A rock in the soil', 'A type of cloud'],
        correct: 'A plant that makes its own food',
        explanation: 'Producers are usually plants that use sunlight to make food through photosynthesis.',
      },
      {
        question: 'What role do decomposers play?',
        options: ['They make food for animals', 'They recycle nutrients', 'They produce sunlight', 'They remove all plants'],
        correct: 'They recycle nutrients',
        explanation: 'Decomposers break down dead matter and return nutrients to the environment.',
      },
      {
        question: 'Which is an example of a consumer?',
        options: ['Mushroom', 'Tree', 'Rabbit', 'Sunflower'],
        correct: 'Rabbit',
        explanation: 'Consumers get energy by eating other organisms, and rabbits eat plants.',
      },
    ],
  },
  {
    id: 'physics',
    title: 'Physics',
    subject: 'Science',
    summary: 'Physics explains motion, force, energy, and the behavior of matter.',
    description:
      'Physics helps us understand why objects move, accelerate, and interact with forces in everyday life.',
    introduction:
      'Physics is the branch of science that studies matter, motion, force, and energy in the natural world.',
    keyConcepts: [
      'Force can change the motion of an object.',
      'Gravity pulls objects toward Earth.',
      'Motion can be described using speed, direction, and position.',
    ],
    example:
      'A ball rolling down a ramp demonstrates how gravity causes motion and changes speed.',
    didYouKnow:
      'Every time you jump, gravity pulls you back down to the ground because of Earth’s mass.',
    takeaways: [
      'Forces can affect motion.',
      'Gravity keeps objects grounded.',
      'Physics explains everyday movement.',
    ],
    activity: {
      prompt: 'Which force pulls objects toward the ground?',
      options: ['Gravity', 'Magnetism', 'Friction', 'Light'],
      correct: 'Gravity',
      explanation: 'Gravity is the force that pulls objects toward Earth.',
    },
    quiz: [
      {
        question: 'What force pulls objects toward Earth?',
        options: ['Gravity', 'Sound', 'Electricity', 'Pressure'],
        correct: 'Gravity',
        explanation: 'Gravity is the force that keeps us on the ground and makes objects fall.',
      },
      {
        question: 'What happens when a force is applied to a moving object?',
        options: ['It always stops instantly', 'Its motion may change', 'It disappears', 'It turns into light'],
        correct: 'Its motion may change',
        explanation: 'A force can speed up, slow down, or change the direction of an object.',
      },
      {
        question: 'Which is a simple example of motion?',
        options: ['A chair sitting still', 'A ball rolling down a ramp', 'A book on a shelf', 'A wall standing still'],
        correct: 'A ball rolling down a ramp',
        explanation: 'Motion means change in position, and a ball rolling is a clear example.',
      },
    ],
  },
  {
    id: 'probability',
    title: 'Probability',
    subject: 'Mathematics',
    summary: 'Probability measures how likely an event is to happen.',
    description:
      'Probability helps us estimate the chance that a certain outcome will occur in daily situations.',
    introduction:
      'Probability is a way to describe how likely an event is to happen, from impossible to certain.',
    keyConcepts: [
      'A fair coin has two equally likely outcomes: heads or tails.',
      'Probability compares favorable outcomes to total outcomes.',
      'Probabilities can be expressed as percentages, fractions, or decimals.',
    ],
    example:
      'When tossing a fair coin, the probability of getting heads is 50% because there are 2 equally likely outcomes.',
    didYouKnow:
      'Probability is used in weather forecasts, games, and decision-making every day.',
    takeaways: [
      'Probability measures chance.',
      'Fair events have equal chances.',
      'Prediction is based on possible outcomes.',
    ],
    activity: {
      prompt: 'If you toss a fair coin, what is the chance of getting heads?',
      options: ['25%', '50%', '75%', '100%'],
      correct: '50%',
      explanation: 'A fair coin has two equally likely outcomes: heads or tails.',
    },
    quiz: [
      {
        question: 'What is the probability of heads when tossing a fair coin?',
        options: ['25%', '50%', '75%', '100%'],
        correct: '50%',
        explanation: 'A fair coin has two equally likely outcomes, so the chance is 1 out of 2.',
      },
      {
        question: 'A die has how many sides?',
        options: ['4', '5', '6', '8'],
        correct: '6',
        explanation: 'A standard die has six faces numbered 1 to 6.',
      },
      {
        question: 'Which event is most likely?',
        options: ['Rolling a 7 on a die', 'Rolling a 2 on a die', 'Rolling a number from 1 to 6', 'Rolling 9 on a die'],
        correct: 'Rolling a number from 1 to 6',
        explanation: 'Any number from 1 to 6 is a valid outcome on a standard die.',
      },
    ],
  },
  {
    id: 'statistics',
    title: 'Statistics',
    subject: 'Mathematics',
    summary: 'Statistics helps us organize and interpret numerical data.',
    description:
      'Statistics allows us to group, summarize, and understand information from surveys and observations.',
    introduction:
      'Statistics is the science of collecting and making sense of data so we can understand patterns and trends.',
    keyConcepts: [
      'Data can be displayed in tables, graphs, and charts to make patterns easier to see.',
      'Mean, median, and mode are common measures used in statistics.',
      'Statistics helps people interpret information about a population or sample.',
    ],
    example:
      'A teacher can use data from a class survey to determine the most popular school club.',
    didYouKnow:
      'Statistics is used in sports, health studies, and business to understand trends and make decisions.',
    takeaways: [
      'Statistics organizes data.',
      'Graphs help reveal patterns.',
      'Average measures summarize information.',
    ],
    activity: {
      prompt: 'Which of these is a measure of central tendency?',
      options: ['Mean', 'Volume', 'Length', 'Area'],
      correct: 'Mean',
      explanation: 'The mean is a statistic that summarizes a set of numbers by finding their average.',
    },
    quiz: [
      {
        question: 'What does statistics help us do?',
        options: ['Ignore data', 'Organize and interpret data', 'Divide numbers by zero', 'Solve only geometry problems'],
        correct: 'Organize and interpret data',
        explanation: 'Statistics is the study of collecting and understanding data.',
      },
      {
        question: 'What is the mean of 2, 4, and 6?',
        options: ['3', '4', '5', '6'],
        correct: '4',
        explanation: 'The sum is 12 and 12 ÷ 3 = 4.',
      },
      {
        question: 'What is a graph used for?',
        options: ['To hide information', 'To display data clearly', 'To solve equations only', 'To measure time'],
        correct: 'To display data clearly',
        explanation: 'Graphs help people understand patterns and trends in data quickly.',
      },
    ],
  },
  {
    id: 'functions',
    title: 'Functions',
    subject: 'Mathematics',
    summary: 'A function relates an input to exactly one output.',
    description:
      'Functions are used to describe relationships between numbers and variables in algebra and real life.',
    introduction:
      'A function is a rule that assigns exactly one output value for each input value.',
    keyConcepts: [
      'Each input in a function has one output.',
      'Functions can be expressed as equations, tables, or graphs.',
      'Functions help model relationships in everyday situations.',
    ],
    example:
      'The function y = 2x gives an output of 6 when x is 3, showing a clear relationship between number pairs.',
    didYouKnow:
      'Functions are used in technology, economics, and science to describe patterns and predict behavior.',
    takeaways: [
      'Functions connect inputs to outputs.',
      'Each input maps to one result.',
      'Graphs help visualize function relationships.',
    ],
    activity: {
      prompt: 'Which rule is a function?',
      options: ['Each x gives one y value', 'Each x gives multiple y values', 'Only odd numbers count', 'No relation is used'],
      correct: 'Each x gives one y value',
      explanation: 'A function matches each input to exactly one output.',
    },
    quiz: [
      {
        question: 'What is a function?',
        options: ['A number with no value', 'A rule that gives one output for each input', 'A slope without a graph', 'A variable with no meaning'],
        correct: 'A rule that gives one output for each input',
        explanation: 'A function defines a clear relationship between inputs and outputs.',
      },
      {
        question: 'If y = x + 3, what is y when x = 2?',
        options: ['2', '3', '5', '6'],
        correct: '5',
        explanation: '2 + 3 = 5, so the output is 5.',
      },
      {
        question: 'Which is a common way to represent a function?',
        options: ['A graph', 'A story only', 'A password', 'A fact sheet without numbers'],
        correct: 'A graph',
        explanation: 'Functions are often visualized using graphs, tables, or equations.',
      },
    ],
  },
];

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {
  screen: Screen = 'splash';
  subjectOptions: Array<'Science' | 'Mathematics'> = ['Science', 'Mathematics'];
  selectedSubject: 'Science' | 'Mathematics' = 'Science';
  selectedTopic: Topic | null = null;
  activityChoice: string | null = null;
  activitySubmitted = false;
  activityFeedback = '';
  quizIndex = 0;
  selectedQuizAnswer: string | null = null;
  answerRequired = false;
  quizSubmitted = false;
  quizFeedback = '';
  quizExplanation = '';
  score = 0;
  correctAnswers = 0;
  showInstructions = false;
  studyFeedback = '';
  topicResults: QuizResult[] = [];
  studyLater: StudyLaterItem[] = [];
  lastGrade: GradeInfo | null = null;
  lastPercentage = 0;
  private splashTimer: ReturnType<typeof setTimeout> | null = null;
  private backButtonListener: { remove: () => Promise<void> } | null = null;

  constructor(private readonly ngZone: NgZone, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadSavedData();
    this.attachAndroidBackHandler();
  }

  ngAfterViewInit(): void {
    this.startSplashAutoTransition();
  }

  ngOnDestroy(): void {
    if (this.splashTimer) {
      clearTimeout(this.splashTimer);
      this.splashTimer = null;
    }

    if (this.backButtonListener) {
      this.backButtonListener.remove();
      this.backButtonListener = null;
    }
  }

  private attachAndroidBackHandler(): void {
    if (!App || typeof App.addListener !== 'function') {
      return;
    }

    void App.addListener('backButton', ({ canGoBack }) => {
      this.ngZone.run(() => {
        const handled = this.handleBackNavigation();

        if (!handled && canGoBack) {
          window.history.back();
        }
      });
    }).then((listener) => {
      this.backButtonListener = listener;
    });
  }

  private handleBackNavigation(): boolean {
    switch (this.screen) {
      case 'splash':
        return true;
      case 'menu':
        if (typeof App.exitApp === 'function') {
          App.exitApp();
        }
        return true;
      case 'subject':
      case 'topics':
      case 'progress':
      case 'studyLater':
        this.backToMenu();
        return true;
      case 'lesson':
        this.screen = 'topics';
        return true;
      case 'activity':
        this.screen = 'lesson';
        return true;
      case 'quiz':
        this.screen = 'activity';
        return true;
      case 'result':
        this.studyAnotherTopic();
        return true;
      default:
        return false;
    }
  }

  private startSplashAutoTransition(): void {
    if (this.splashTimer) {
      clearTimeout(this.splashTimer);
    }

    this.splashTimer = window.setTimeout(() => {
      this.ngZone.run(() => {
        if (this.screen === 'splash') {
          this.screen = 'menu';
          this.cdr.detectChanges();
        }
      });
    }, 2300);
  }

  private goToMenu(): void {
    if (this.splashTimer) {
      clearTimeout(this.splashTimer);
      this.splashTimer = null;
    }

    if (this.screen === 'splash') {
      this.ngZone.run(() => {
        this.screen = 'menu';
        this.cdr.detectChanges();
      });
    }
  }

  get availableTopics(): Topic[] {
    return TOPICS.filter((topic) => topic.subject === this.selectedSubject);
  }

  get currentQuestion(): QuizQuestion | null {
    if (!this.selectedTopic) {
      return null;
    }

    return this.selectedTopic.quiz[this.quizIndex] ?? null;
  }

  get quizProgress(): number {
    if (!this.selectedTopic) {
      return 0;
    }

    return ((this.quizIndex + 1) / this.selectedTopic.quiz.length) * 100;
  }

  get overallProgressPercent(): number {
    return Math.round((this.completedCount / TOPICS.length) * 100);
  }

  get completedCount(): number {
    return this.topicResults.length;
  }

  get totalTopics(): number {
    return TOPICS.length;
  }

  get topicsInProgress(): number {
    return TOPICS.filter(
      (topic) =>
        !this.topicResults.some((result) => result.topicId === topic.id) &&
        (this.selectedTopic?.id === topic.id || this.studyLater.some((item) => item.topicId === topic.id)),
    ).length;
  }

  get savedLaterCount(): number {
    return this.studyLater.length;
  }

  get averageGradePercent(): number {
    if (!this.topicResults.length) {
      return 0;
    }

    const total = this.topicResults.reduce((sum, result) => sum + result.percentage, 0);
    return Math.round(total / this.topicResults.length);
  }

  get completedTopicResults(): QuizResult[] {
    return [...this.topicResults].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }

  getGradeDetails(percentage: number): GradeInfo {
    if (percentage >= 90) {
      return {
        label: '1.00',
        grade: 1,
        description: 'Excellent',
        performanceMessage: 'Excellent! You have a strong understanding of this lesson.',
      };
    }

    if (percentage >= 85) {
      return {
        label: '1.25',
        grade: 1.25,
        description: 'Very Good',
        performanceMessage: 'Great job! You understand most of the lesson.',
      };
    }

    if (percentage >= 80) {
      return {
        label: '1.50',
        grade: 1.5,
        description: 'Good',
        performanceMessage: 'Great job! You understand most of the lesson.',
      };
    }

    if (percentage >= 75) {
      return {
        label: '1.75',
        grade: 1.75,
        description: 'Passing',
        performanceMessage: 'You are doing well! A little more review can help strengthen your understanding.',
      };
    }

    return {
      label: '2.00',
      grade: 2,
      description: 'Needs Improvement',
      performanceMessage: 'This topic may be challenging right now. We recommend reviewing the lesson and trying the quiz again.',
    };
  }

  startApp(): void {
    this.goToMenu();
  }

  openSubjectScreen(): void {
    this.screen = 'subject';
  }

  chooseSubject(subject: 'Science' | 'Mathematics'): void {
    this.selectedSubject = subject;
    this.screen = 'topics';
  }

  openTopic(topic: Topic): void {
    this.selectedTopic = topic;
    this.activityChoice = null;
    this.activitySubmitted = false;
    this.activityFeedback = '';
    this.quizIndex = 0;
    this.selectedQuizAnswer = null;
    this.answerRequired = false;
    this.quizSubmitted = false;
    this.quizFeedback = '';
    this.quizExplanation = '';
    this.score = 0;
    this.correctAnswers = 0;
    this.studyFeedback = '';
    this.screen = 'lesson';
  }

  beginActivity(): void {
    this.screen = 'activity';
  }

  submitActivity(): void {
    if (!this.selectedTopic || !this.activityChoice) {
      return;
    }

    this.activitySubmitted = true;

    if (this.activityChoice === this.selectedTopic.activity.correct) {
      this.activityFeedback = 'Correct! Great work.';
      return;
    }

    this.activityFeedback = `Incorrect. ${this.selectedTopic.activity.explanation}`;
  }

  continueToQuiz(): void {
    this.screen = 'quiz';
  }

  submitQuizAnswer(): void {
    if (!this.currentQuestion || !this.selectedQuizAnswer) {
      this.answerRequired = true;
      return;
    }

    this.answerRequired = false;
    this.quizSubmitted = true;

    if (this.selectedQuizAnswer === this.currentQuestion.correct) {
      this.score += 1;
      this.correctAnswers += 1;
      this.quizFeedback = 'Correct! +1 point';
      this.quizExplanation = this.currentQuestion.explanation;
      return;
    }

    this.quizFeedback = 'Incorrect';
    this.quizExplanation = `Correct Answer: ${this.currentQuestion.correct}. ${this.currentQuestion.explanation}`;
  }

  retryQuestion(): void {
    this.selectedQuizAnswer = null;
    this.quizSubmitted = false;
    this.quizFeedback = '';
    this.quizExplanation = '';
    this.answerRequired = false;
  }

  nextQuestion(): void {
    if (!this.selectedTopic) {
      return;
    }

    if (this.quizIndex < this.selectedTopic.quiz.length - 1) {
      this.quizIndex += 1;
      this.selectedQuizAnswer = null;
      this.quizSubmitted = false;
      this.quizFeedback = '';
      this.quizExplanation = '';
      this.answerRequired = false;
      return;
    }

    this.completeQuiz();
  }

  retakeQuiz(): void {
    this.quizIndex = 0;
    this.selectedQuizAnswer = null;
    this.answerRequired = false;
    this.quizSubmitted = false;
    this.quizFeedback = '';
    this.quizExplanation = '';
    this.score = 0;
    this.correctAnswers = 0;
    this.screen = 'quiz';
  }

  studyAnotherTopic(): void {
    this.selectedTopic = null;
    this.activityChoice = null;
    this.activitySubmitted = false;
    this.activityFeedback = '';
    this.quizIndex = 0;
    this.selectedQuizAnswer = null;
    this.answerRequired = false;
    this.quizSubmitted = false;
    this.quizFeedback = '';
    this.quizExplanation = '';
    this.score = 0;
    this.correctAnswers = 0;
    this.screen = 'topics';
  }

  onTopBack(): void {
    this.handleBackNavigation();
  }

  backToMenu(): void {
    this.selectedTopic = null;
    this.activityChoice = null;
    this.activitySubmitted = false;
    this.activityFeedback = '';
    this.quizIndex = 0;
    this.selectedQuizAnswer = null;
    this.answerRequired = false;
    this.quizSubmitted = false;
    this.quizFeedback = '';
    this.quizExplanation = '';
    this.score = 0;
    this.correctAnswers = 0;
    this.screen = 'menu';
  }

  openProgress(): void {
    this.screen = 'progress';
  }

  openStudyLater(): void {
    this.screen = 'studyLater';
  }

  saveForLater(topic: Topic | null): void {
    if (!topic) {
      return;
    }

    const exists = this.studyLater.some((item) => item.topicId === topic.id);

    if (exists) {
      this.studyLater = this.studyLater.filter((item) => item.topicId !== topic.id);
      this.studyFeedback = 'Removed from Study Later';
    } else {
      this.studyLater = [
        {
          topicId: topic.id,
          title: topic.title,
          subject: topic.subject,
          savedAt: new Date().toISOString(),
        },
        ...this.studyLater,
      ];
      this.studyFeedback = 'Saved to Study Later';
    }

    this.persistStudyLater();
  }

  continueSavedTopic(topicId: string): void {
    const topic = TOPICS.find((item) => item.id === topicId);
    if (!topic) {
      return;
    }

    this.openTopic(topic);
  }

  removeSavedTopic(topicId: string): void {
    this.studyLater = this.studyLater.filter((item) => item.topicId !== topicId);
    this.persistStudyLater();
  }

  restartApp(): void {
    this.screen = 'splash';
    this.selectedSubject = 'Science';
    this.selectedTopic = null;
    this.activityChoice = null;
    this.activitySubmitted = false;
    this.activityFeedback = '';
    this.quizIndex = 0;
    this.selectedQuizAnswer = null;
    this.answerRequired = false;
    this.quizSubmitted = false;
    this.quizFeedback = '';
    this.quizExplanation = '';
    this.score = 0;
    this.correctAnswers = 0;
    this.studyFeedback = '';
    setTimeout(() => {
      if (this.screen === 'splash') {
        this.screen = 'menu';
      }
    }, 1800);
  }

  getTopicStatus(topic: Topic): 'Not Started' | 'In Progress' | 'Completed' | 'Study Later' {
    if (this.topicResults.some((result) => result.topicId === topic.id)) {
      return 'Completed';
    }

    if (this.studyLater.some((item) => item.topicId === topic.id)) {
      return 'Study Later';
    }

    if (this.selectedTopic?.id === topic.id) {
      return 'In Progress';
    }

    return 'Not Started';
  }

  getTopicStatusClass(topic: Topic): string {
    const status = this.getTopicStatus(topic);

    if (status === 'Completed') {
      return 'status-completed';
    }

    if (status === 'Study Later') {
      return 'status-study-later';
    }

    if (status === 'In Progress') {
      return 'status-in-progress';
    }

    return 'status-not-started';
  }

  private loadSavedData(): void {
    this.topicResults = this.safeReadJson(STORAGE_KEYS.progress, []);
    this.studyLater = this.safeReadJson(STORAGE_KEYS.studyLater, []);
  }

  private persistProgress(): void {
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(this.topicResults));
  }

  private persistStudyLater(): void {
    localStorage.setItem(STORAGE_KEYS.studyLater, JSON.stringify(this.studyLater));
  }

  private safeReadJson<T>(key: string, fallback: T): T {
    try {
      const value = localStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private completeQuiz(): void {
    if (!this.selectedTopic) {
      return;
    }

    const total = this.selectedTopic.quiz.length;
    const percentage = Math.round((this.correctAnswers / total) * 100);
    const gradeInfo = this.getGradeDetails(percentage);

    this.lastPercentage = percentage;
    this.lastGrade = gradeInfo;

    const result: QuizResult = {
      topicId: this.selectedTopic.id,
      title: this.selectedTopic.title,
      subject: this.selectedTopic.subject,
      score: this.score,
      total,
      percentage,
      grade: gradeInfo.grade,
      gradeLabel: gradeInfo.label,
      description: gradeInfo.description,
      performanceMessage: gradeInfo.performanceMessage,
      completedAt: new Date().toISOString(),
    };

    this.topicResults = this.topicResults.filter((item) => item.topicId !== this.selectedTopic?.id);
    this.topicResults.push(result);
    this.persistProgress();

    this.screen = 'result';
  }
}