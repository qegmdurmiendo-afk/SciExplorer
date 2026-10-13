import { App } from '@capacitor/app';
import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { AiChatService, ChatMessage } from '../shared/services/ai-chat.service';
import { LearningCoachRecommendation, LearningCoachService, QuizAnswerRecord } from '../shared/services/learning-coach.service';

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

interface Competency {
  id: string;
  title: string;
  description: string;
  topicId: string;
  lessonRef: string;
}

interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correct: string;
  explanation: string;
  competencyId?: string;
}

interface ActivityTask {
  prompt: string;
  options: string[];
  correct: string;
  explanation: string;
  competencyId?: string;
}

interface CurriculumSource {
  authority: string;
  title: string;
  url: string;
  note: string;
}

interface CurriculumInfo {
  gradeLevel: 11 | 12;
  strand: 'STEM' | 'ABM' | 'HUMSS' | 'ICT' | 'TVL';
  subject: string;
  quarter: number;
  competencyCode: string;
  competencyStatement: string;
  learningObjective: string;
  source: CurriculumSource;
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
  curriculum: CurriculumInfo;
  competencies: Competency[];
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
  recommendation?: LearningCoachRecommendation | null;
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
    curriculum: {
      gradeLevel: 12,
      strand: 'STEM',
      subject: 'Biology',
      quarter: 4,
      competencyCode: 'STEM-BIO-12-04',
      competencyStatement: 'Explain how genes and DNA determine inherited traits and variation in organisms.',
      learningObjective: 'Identify inherited traits and describe how genes influence biological variation.',
      source: {
        authority: 'Department of Education (DepEd), Philippines',
        title: 'K to 12 Senior High School Curriculum Guide',
        url: 'https://www.deped.gov.ph/k-to-12/',
        note: 'Official DepEd curriculum guidance used as a general reference for SHS STEM learning competencies.',
      },
    },
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
    competencies: [
      {
        id: 'genetics-basic',
        title: 'Basic genetic concepts',
        description: 'Understand DNA, genes, and what inherited traits are.',
        topicId: 'genetics',
        lessonRef: 'genetics-basic',
      },
      {
        id: 'genetics-inheritance',
        title: 'Inheritance patterns',
        description: 'Analyze how traits pass from parents to offspring.',
        topicId: 'genetics',
        lessonRef: 'genetics-inheritance',
      },
    ],
    activity: {
      prompt: 'Which one is an inherited trait?',
      options: ['Eye color', 'The color of a book', 'A school uniform', 'The weather today'],
      correct: 'Eye color',
      explanation: 'Inherited traits are passed from parents to children through genes.',
      competencyId: 'genetics-basic',
    },
    quiz: [
      {
        id: 'genetics-q1',
        question: 'What does DNA contain?',
        options: ['Food energy', 'Genetic instructions', 'Sound waves', 'Plant roots'],
        correct: 'Genetic instructions',
        explanation: 'DNA carries the genetic instructions used to build and maintain living things.',
        competencyId: 'genetics-basic',
      },
      {
        id: 'genetics-q2',
        question: 'Which is an example of an inherited trait?',
        options: ['Blood type', 'Favorite song', 'Laptop brand', 'Daily schedule'],
        correct: 'Blood type',
        explanation: 'Blood type is inherited through genes from parents.',
        competencyId: 'genetics-inheritance',
      },
      {
        id: 'genetics-q3',
        question: 'What are genes?',
        options: ['Sections of DNA', 'Types of cells', 'Weather systems', 'Electric currents'],
        correct: 'Sections of DNA',
        explanation: 'Genes are specific sections of DNA that influence traits and functions.',
        competencyId: 'genetics-inheritance',
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
    curriculum: {
      gradeLevel: 11,
      strand: 'STEM',
      subject: 'Earth and Life Science',
      quarter: 2,
      competencyCode: 'STEM-ELS-11-02',
      competencyStatement: 'Analyze how organisms interact with each other and their environment in an ecosystem.',
      learningObjective: 'Identify producers, consumers, decomposers, and explain how energy flows through an ecosystem.',
      source: {
        authority: 'Department of Education (DepEd), Philippines',
        title: 'K to 12 Senior High School Curriculum Guide',
        url: 'https://www.deped.gov.ph/k-to-12/',
        note: 'Official DepEd curriculum guidance used as a general reference for SHS STEM learning competencies.',
      },
    },
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
    competencies: [
      {
        id: 'ecosystem-producers',
        title: 'Food chains and producers',
        description: 'Identify producers, consumers, and how energy moves through ecosystems.',
        topicId: 'ecosystems',
        lessonRef: 'ecosystems-producers',
      },
      {
        id: 'ecosystem-balance',
        title: 'Ecosystem balance',
        description: 'Understand how decomposers and environmental balance maintain healthy ecosystems.',
        topicId: 'ecosystems',
        lessonRef: 'ecosystems-balance',
      },
    ],
    activity: {
      prompt: 'Which organism is a producer?',
      options: ['Grass', 'Lion', 'Rabbit', 'Bird'],
      correct: 'Grass',
      explanation: 'Producers like plants make their own food using sunlight.',
      competencyId: 'ecosystem-producers',
    },
    quiz: [
      {
        id: 'ecosystem-q1',
        question: 'What is a producer in an ecosystem?',
        options: ['An animal that hunts other animals', 'A plant that makes its own food', 'A rock in the soil', 'A type of cloud'],
        correct: 'A plant that makes its own food',
        explanation: 'Producers are usually plants that use sunlight to make food through photosynthesis.',
        competencyId: 'ecosystem-producers',
      },
      {
        id: 'ecosystem-q2',
        question: 'What role do decomposers play?',
        options: ['They make food for animals', 'They recycle nutrients', 'They produce sunlight', 'They remove all plants'],
        correct: 'They recycle nutrients',
        explanation: 'Decomposers break down dead matter and return nutrients to the environment.',
        competencyId: 'ecosystem-balance',
      },
      {
        id: 'ecosystem-q3',
        question: 'Which is an example of a consumer?',
        options: ['Mushroom', 'Tree', 'Rabbit', 'Sunflower'],
        correct: 'Rabbit',
        explanation: 'Consumers get energy by eating other organisms, and rabbits eat plants.',
        competencyId: 'ecosystem-producers',
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
    curriculum: {
      gradeLevel: 12,
      strand: 'STEM',
      subject: 'General Physics',
      quarter: 2,
      competencyCode: 'STEM-PHY-12-02',
      competencyStatement: 'Explain how forces and motion affect the behavior of objects in everyday life.',
      learningObjective: 'Describe motion, gravity, and force in real-world examples and simple calculations.',
      source: {
        authority: 'Department of Education (DepEd), Philippines',
        title: 'K to 12 Senior High School Curriculum Guide',
        url: 'https://www.deped.gov.ph/k-to-12/',
        note: 'Official DepEd curriculum guidance used as a general reference for SHS STEM learning competencies.',
      },
    },
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
    competencies: [
      {
        id: 'physics-forces',
        title: 'Force and motion',
        description: 'Explain forces and how they change the motion of objects.',
        topicId: 'physics',
        lessonRef: 'physics-force-motion',
      },
      {
        id: 'physics-gravity',
        title: 'Gravity',
        description: 'Understand how gravity affects motion and everyday objects.',
        topicId: 'physics',
        lessonRef: 'physics-gravity',
      },
    ],
    activity: {
      prompt: 'Which force pulls objects toward the ground?',
      options: ['Gravity', 'Magnetism', 'Friction', 'Light'],
      correct: 'Gravity',
      explanation: 'Gravity is the force that pulls objects toward Earth.',
      competencyId: 'physics-gravity',
    },
    quiz: [
      {
        id: 'physics-q1',
        question: 'What force pulls objects toward Earth?',
        options: ['Gravity', 'Sound', 'Electricity', 'Pressure'],
        correct: 'Gravity',
        explanation: 'Gravity is the force that keeps us on the ground and makes objects fall.',
        competencyId: 'physics-gravity',
      },
      {
        id: 'physics-q2',
        question: 'What happens when a force is applied to a moving object?',
        options: ['It always stops instantly', 'Its motion may change', 'It disappears', 'It turns into light'],
        correct: 'Its motion may change',
        explanation: 'A force can speed up, slow down, or change the direction of an object.',
        competencyId: 'physics-forces',
      },
      {
        id: 'physics-q3',
        question: 'Which is a simple example of motion?',
        options: ['A chair sitting still', 'A ball rolling down a ramp', 'A book on a shelf', 'A wall standing still'],
        correct: 'A ball rolling down a ramp',
        explanation: 'Motion means change in position, and a ball rolling is a clear example.',
        competencyId: 'physics-forces',
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
    curriculum: {
      gradeLevel: 11,
      strand: 'STEM',
      subject: 'Statistics and Probability',
      quarter: 2,
      competencyCode: 'STEM-SP-11-02',
      competencyStatement: 'Solve problems involving the probability of simple events and interpret outcomes in context.',
      learningObjective: 'Use sample spaces, possible outcomes, and probability rules to solve everyday problems.',
      source: {
        authority: 'Department of Education (DepEd), Philippines',
        title: 'K to 12 Senior High School Curriculum Guide',
        url: 'https://www.deped.gov.ph/k-to-12/',
        note: 'Official DepEd curriculum guidance used as a general reference for SHS STEM learning competencies.',
      },
    },
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
    competencies: [
      {
        id: 'probability-outcomes',
        title: 'Sample space and outcomes',
        description: 'Understand the total number of possible results in a chance event.',
        topicId: 'probability',
        lessonRef: 'probability-outcomes',
      },
      {
        id: 'probability-calculation',
        title: 'Probability calculation',
        description: 'Compute chance using favorable outcomes over total outcomes.',
        topicId: 'probability',
        lessonRef: 'probability-calculation',
      },
    ],
    activity: {
      prompt: 'If you toss a fair coin, what is the chance of getting heads?',
      options: ['25%', '50%', '75%', '100%'],
      correct: '50%',
      explanation: 'A fair coin has two equally likely outcomes: heads or tails.',
      competencyId: 'probability-outcomes',
    },
    quiz: [
      {
        id: 'probability-q1',
        question: 'What is the probability of heads when tossing a fair coin?',
        options: ['25%', '50%', '75%', '100%'],
        correct: '50%',
        explanation: 'A fair coin has two equally likely outcomes, so the chance is 1 out of 2.',
        competencyId: 'probability-outcomes',
      },
      {
        id: 'probability-q2',
        question: 'A die has how many sides?',
        options: ['4', '5', '6', '8'],
        correct: '6',
        explanation: 'A standard die has six faces numbered 1 to 6.',
        competencyId: 'probability-calculation',
      },
      {
        id: 'probability-q3',
        question: 'Which event is most likely?',
        options: ['Rolling a 7 on a die', 'Rolling a 2 on a die', 'Rolling a number from 1 to 6', 'Rolling 9 on a die'],
        correct: 'Rolling a number from 1 to 6',
        explanation: 'Any number from 1 to 6 is a valid outcome on a standard die.',
        competencyId: 'probability-calculation',
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
    curriculum: {
      gradeLevel: 11,
      strand: 'STEM',
      subject: 'Statistics and Probability',
      quarter: 3,
      competencyCode: 'STEM-SP-11-03',
      competencyStatement: 'Interpret data using measures of central tendency and describe patterns in numerical information.',
      learningObjective: 'Organize data and interpret mean, median, and mode in context.',
      source: {
        authority: 'Department of Education (DepEd), Philippines',
        title: 'K to 12 Senior High School Curriculum Guide',
        url: 'https://www.deped.gov.ph/k-to-12/',
        note: 'Official DepEd curriculum guidance used as a general reference for SHS STEM learning competencies.',
      },
    },
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
    competencies: [
      {
        id: 'statistics-data',
        title: 'Data interpretation',
        description: 'Organize and interpret numerical information in a meaningful way.',
        topicId: 'statistics',
        lessonRef: 'statistics-data',
      },
      {
        id: 'statistics-average',
        title: 'Measures of central tendency',
        description: 'Use mean, median, and mode to summarize a set of data.',
        topicId: 'statistics',
        lessonRef: 'statistics-average',
      },
    ],
    activity: {
      prompt: 'Which of these is a measure of central tendency?',
      options: ['Mean', 'Volume', 'Length', 'Area'],
      correct: 'Mean',
      explanation: 'The mean is a statistic that summarizes a set of numbers by finding their average.',
      competencyId: 'statistics-average',
    },
    quiz: [
      {
        id: 'statistics-q1',
        question: 'What does statistics help us do?',
        options: ['Ignore data', 'Organize and interpret data', 'Divide numbers by zero', 'Solve only geometry problems'],
        correct: 'Organize and interpret data',
        explanation: 'Statistics is the study of collecting and understanding data.',
        competencyId: 'statistics-data',
      },
      {
        id: 'statistics-q2',
        question: 'What is the mean of 2, 4, and 6?',
        options: ['3', '4', '5', '6'],
        correct: '4',
        explanation: 'The sum is 12 and 12 ÷ 3 = 4.',
        competencyId: 'statistics-average',
      },
      {
        id: 'statistics-q3',
        question: 'What is a graph used for?',
        options: ['To hide information', 'To display data clearly', 'To solve equations only', 'To measure time'],
        correct: 'To display data clearly',
        explanation: 'Graphs help people understand patterns and trends in data quickly.',
        competencyId: 'statistics-data',
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
    curriculum: {
      gradeLevel: 11,
      strand: 'STEM',
      subject: 'General Mathematics',
      quarter: 1,
      competencyCode: 'STEM-GM-11-01',
      competencyStatement: 'Represent real-life situations using functions and interpret their relationships.',
      learningObjective: 'Identify function rules, evaluate outputs, and interpret relationships in tables, graphs, and equations.',
      source: {
        authority: 'Department of Education (DepEd), Philippines',
        title: 'K to 12 Senior High School Curriculum Guide',
        url: 'https://www.deped.gov.ph/k-to-12/',
        note: 'Official DepEd curriculum guidance used as a general reference for SHS STEM learning competencies.',
      },
    },
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
    competencies: [
      {
        id: 'functions-rule',
        title: 'Function rules',
        description: 'Understand how a function assigns one output to each input.',
        topicId: 'functions',
        lessonRef: 'functions-rule',
      },
      {
        id: 'functions-graphing',
        title: 'Function representation',
        description: 'Use equations, tables, and graphs to model relationships.',
        topicId: 'functions',
        lessonRef: 'functions-graphing',
      },
    ],
    activity: {
      prompt: 'Which rule is a function?',
      options: ['Each x gives one y value', 'Each x gives multiple y values', 'Only odd numbers count', 'No relation is used'],
      correct: 'Each x gives one y value',
      explanation: 'A function matches each input to exactly one output.',
      competencyId: 'functions-rule',
    },
    quiz: [
      {
        id: 'functions-q1',
        question: 'What is a function?',
        options: ['A number with no value', 'A rule that gives one output for each input', 'A slope without a graph', 'A variable with no meaning'],
        correct: 'A rule that gives one output for each input',
        explanation: 'A function defines a clear relationship between inputs and outputs.',
        competencyId: 'functions-rule',
      },
      {
        id: 'functions-q2',
        question: 'If y = x + 3, what is y when x = 2?',
        options: ['2', '3', '5', '6'],
        correct: '5',
        explanation: '2 + 3 = 5, so the output is 5.',
        competencyId: 'functions-rule',
      },
      {
        id: 'functions-q3',
        question: 'Which is a common way to represent a function?',
        options: ['A graph', 'A story only', 'A password', 'A fact sheet without numbers'],
        correct: 'A graph',
        explanation: 'Functions are often visualized using graphs, tables, or equations.',
        competencyId: 'functions-graphing',
      },
    ],
  },
  {
    id: 'cell-structure',
    title: 'Cell Structure',
    subject: 'Science',
    summary: 'Cells are the basic units of life that perform essential functions.',
    description:
      'Cell structure helps us understand how living things are built and how life processes are carried out inside cells.',
    curriculum: {
      gradeLevel: 11,
      strand: 'STEM',
      subject: 'Earth and Life Science',
      quarter: 1,
      competencyCode: 'STEM-ELS-11-01',
      competencyStatement: 'Describe the structure and function of cells and explain how organelles support life processes.',
      learningObjective: 'Identify major cell organelles and explain their roles in cellular function.',
      source: {
        authority: 'Department of Education (DepEd), Philippines',
        title: 'K to 12 Senior High School Curriculum Guide',
        url: 'https://www.deped.gov.ph/k-to-12/',
        note: 'Official DepEd curriculum guidance used as a general reference for SHS STEM learning competencies.',
      },
    },
    introduction:
      'Cells are the smallest units of life, and each part of the cell helps it survive and function properly.',
    keyConcepts: [
      'The nucleus stores genetic information and controls cell activity.',
      'Mitochondria release energy for cell processes.',
      'The cell membrane controls what enters and leaves the cell.',
    ],
    example:
      'A muscle cell contains many mitochondria because it needs lots of energy to contract and move the body.',
    didYouKnow:
      'Your body contains trillions of cells, each specialized to do a specific job.',
    takeaways: [
      'Cells are the basic unit of life.',
      'Organelles help cells survive and work.',
      'Structure and function are connected in biology.',
    ],
    competencies: [
      {
        id: 'cell-organelles',
        title: 'Cell organelles',
        description: 'Identify and describe important cell structures and their functions.',
        topicId: 'cell-structure',
        lessonRef: 'cell-organelles',
      },
      {
        id: 'cell-transport',
        title: 'Cell membranes and transport',
        description: 'Explain how the membrane regulates what enters and leaves the cell.',
        topicId: 'cell-structure',
        lessonRef: 'cell-transport',
      },
    ],
    activity: {
      prompt: 'Which organelle is known as the cell’s control center?',
      options: ['Nucleus', 'Cell wall', 'Cytoplasm', 'Vacuole'],
      correct: 'Nucleus',
      explanation: 'The nucleus holds the genetic information and directs many cell activities.',
      competencyId: 'cell-organelles',
    },
    quiz: [
      {
        id: 'cell-q1',
        question: 'What is the main job of the cell membrane?',
        options: ['Store DNA', 'Control movement in and out of the cell', 'Make proteins', 'Break down sunlight'],
        correct: 'Control movement in and out of the cell',
        explanation: 'The membrane acts like a selective barrier that regulates passage into and out of the cell.',
        competencyId: 'cell-transport',
      },
      {
        id: 'cell-q2',
        question: 'Which organelle produces most of the cell’s energy?',
        options: ['Mitochondria', 'Chloroplast', 'Nucleus', 'Lysosome'],
        correct: 'Mitochondria',
        explanation: 'Mitochondria break down food molecules to release usable energy for the cell.',
        competencyId: 'cell-organelles',
      },
      {
        id: 'cell-q3',
        question: 'Why are cells considered the basic unit of life?',
        options: ['They are the smallest structure in the body', 'They carry out life processes', 'They only exist in plants', 'They are always visible to the eye'],
        correct: 'They carry out life processes',
        explanation: 'All living organisms are made of cells, and cells perform the functions that keep life going.',
        competencyId: 'cell-organelles',
      },
    ],
  },
  {
    id: 'photosynthesis',
    title: 'Photosynthesis',
    subject: 'Science',
    summary: 'Plants use sunlight to make food and release oxygen.',
    description:
      'Photosynthesis explains how plants convert light energy into chemical energy to support growth and life on Earth.',
    curriculum: {
      gradeLevel: 11,
      strand: 'STEM',
      subject: 'Earth and Life Science',
      quarter: 2,
      competencyCode: 'STEM-ELS-11-04',
      competencyStatement: 'Explain the process of photosynthesis and describe how plants convert light energy into stored chemical energy.',
      learningObjective: 'Describe the role of sunlight, water, carbon dioxide, and chlorophyll in photosynthesis.',
      source: {
        authority: 'Department of Education (DepEd), Philippines',
        title: 'K to 12 Senior High School Curriculum Guide',
        url: 'https://www.deped.gov.ph/k-to-12/',
        note: 'Official DepEd curriculum guidance used as a general reference for SHS STEM learning competencies.',
      },
    },
    introduction:
      'Photosynthesis is the process by which green plants use sunlight to make their own food.',
    keyConcepts: [
      'Chlorophyll captures sunlight in plant leaves.',
      'Plants use carbon dioxide and water to make glucose.',
      'Oxygen is released as a by-product of this process.',
    ],
    example:
      'A sunflower uses sunlight, water, and carbon dioxide to make sugar and oxygen during the day.',
    didYouKnow:
      'Photosynthesis is the foundation of most food chains on Earth.',
    takeaways: [
      'Plants make their own food.',
      'Sunlight powers photosynthesis.',
      'Oxygen and glucose are key outputs.',
    ],
    competencies: [
      {
        id: 'photosynthesis-process',
        title: 'Photosynthesis process',
        description: 'Explain how light energy is used to create food in plants.',
        topicId: 'photosynthesis',
        lessonRef: 'photosynthesis-process',
      },
      {
        id: 'photosynthesis-role',
        title: 'Importance of photosynthesis',
        description: 'Explain why photosynthesis supports ecosystems and plant life.',
        topicId: 'photosynthesis',
        lessonRef: 'photosynthesis-role',
      },
    ],
    activity: {
      prompt: 'What gas do plants take in during photosynthesis?',
      options: ['Oxygen', 'Carbon dioxide', 'Helium', 'Nitrogen'],
      correct: 'Carbon dioxide',
      explanation: 'Plants take in carbon dioxide and use it together with water and sunlight to make glucose.',
      competencyId: 'photosynthesis-process',
    },
    quiz: [
      {
        id: 'photo-q1',
        question: 'What pigment captures sunlight in leaves?',
        options: ['Chlorophyll', 'Hemoglobin', 'Keratin', 'Insulin'],
        correct: 'Chlorophyll',
        explanation: 'Chlorophyll absorbs light energy needed for photosynthesis.',
        competencyId: 'photosynthesis-process',
      },
      {
        id: 'photo-q2',
        question: 'Which product is released by plants during photosynthesis?',
        options: ['Oxygen', 'Salt', 'Carbon monoxide', 'Iron'],
        correct: 'Oxygen',
        explanation: 'Oxygen is released as a by-product when plants make food during photosynthesis.',
        competencyId: 'photosynthesis-role',
      },
      {
        id: 'photo-q3',
        question: 'Why is photosynthesis important?',
        options: ['It makes food for plants and supports many food chains', 'It only happens at night', 'It creates rocks', 'It removes all water from the soil'],
        correct: 'It makes food for plants and supports many food chains',
        explanation: 'Photosynthesis supports plant growth and supplies energy for many organisms in ecosystems.',
        competencyId: 'photosynthesis-role',
      },
    ],
  },
  {
    id: 'trigonometry',
    title: 'Trigonometry',
    subject: 'Mathematics',
    summary: 'Trigonometry connects angles to side lengths in triangles.',
    description:
      'Trigonometry helps us solve problems involving right triangles and real-life angle measurements.',
    curriculum: {
      gradeLevel: 11,
      strand: 'STEM',
      subject: 'General Mathematics',
      quarter: 3,
      competencyCode: 'STEM-GM-11-03',
      competencyStatement: 'Use trigonometric ratios to solve problems involving right triangles and contextual applications.',
      learningObjective: 'Apply sine, cosine, and tangent to triangle measurements and everyday situations.',
      source: {
        authority: 'Department of Education (DepEd), Philippines',
        title: 'K to 12 Senior High School Curriculum Guide',
        url: 'https://www.deped.gov.ph/k-to-12/',
        note: 'Official DepEd curriculum guidance used as a general reference for SHS STEM learning competencies.',
      },
    },
    introduction:
      'Trigonometry studies the relationships between the sides and angles of triangles.',
    keyConcepts: [
      'The sine, cosine, and tangent ratios relate angle measures to triangle side lengths.',
      'Right triangles are often used to model real-life situations.',
      'Knowledge of angles helps solve measurements in construction, navigation, and design.',
    ],
    example:
      'If a ladder leans against a wall, trigonometry can help determine the height it reaches.',
    didYouKnow:
      'Trigonometry is used in architecture, engineering, and astronomy.',
    takeaways: [
      'Triangles can model real-world problems.',
      'Ratios help describe side relationships.',
      'Angles support precise measurement and design.',
    ],
    competencies: [
      {
        id: 'trig-ratios',
        title: 'Trigonometric ratios',
        description: 'Use sine, cosine, and tangent to relate angles and sides in right triangles.',
        topicId: 'trigonometry',
        lessonRef: 'trig-ratios',
      },
      {
        id: 'trig-applications',
        title: 'Real-world applications',
        description: 'Apply trig concepts to design, height, and distance problems.',
        topicId: 'trigonometry',
        lessonRef: 'trig-applications',
      },
    ],
    activity: {
      prompt: 'In a right triangle, what does sine compare?',
      options: ['Opposite over hypotenuse', 'Adjacent over hypotenuse', 'Opposite over adjacent', 'Angle over side'],
      correct: 'Opposite over hypotenuse',
      explanation: 'Sine is defined as the ratio of the opposite side to the hypotenuse in a right triangle.',
      competencyId: 'trig-ratios',
    },
    quiz: [
      {
        id: 'trig-q1',
        question: 'What is the cosine ratio?',
        options: ['Opposite over hypotenuse', 'Adjacent over hypotenuse', 'Opposite over adjacent', 'Angle times side'],
        correct: 'Adjacent over hypotenuse',
        explanation: 'Cosine compares the adjacent side to the hypotenuse in a right triangle.',
        competencyId: 'trig-ratios',
      },
      {
        id: 'trig-q2',
        question: 'Which trigonometric function is used for opposite over adjacent?',
        options: ['Sine', 'Cosine', 'Tangent', 'Secant'],
        correct: 'Tangent',
        explanation: 'Tangent is the ratio of the opposite side to the adjacent side.',
        competencyId: 'trig-ratios',
      },
      {
        id: 'trig-q3',
        question: 'Why is trigonometry useful?',
        options: ['It helps measure distances indirectly', 'It always gives whole numbers', 'It removes the need for angles', 'It only works in algebra'],
        correct: 'It helps measure distances indirectly',
        explanation: 'Trigonometry allows us to calculate unknown lengths and angles in real-world situations.',
        competencyId: 'trig-applications',
      },
    ],
  },
  {
    id: 'logarithms',
    title: 'Logarithms',
    subject: 'Mathematics',
    summary: 'Logarithms help us solve exponential equations and model growth.',
    description:
      'Logarithms are useful when values grow very quickly or when we need to reverse exponential relationships.',
    curriculum: {
      gradeLevel: 12,
      strand: 'STEM',
      subject: 'General Mathematics',
      quarter: 3,
      competencyCode: 'STEM-GM-12-03',
      competencyStatement: 'Solve logarithmic equations and interpret their use in exponential growth and decay contexts.',
      learningObjective: 'Understand the relationship between exponents and logarithms and apply them to problem solving.',
      source: {
        authority: 'Department of Education (DepEd), Philippines',
        title: 'K to 12 Senior High School Curriculum Guide',
        url: 'https://www.deped.gov.ph/k-to-12/',
        note: 'Official DepEd curriculum guidance used as a general reference for SHS STEM learning competencies.',
      },
    },
    introduction:
      'A logarithm tells us what exponent is needed to reach a value from a base.',
    keyConcepts: [
      'Logarithms are the inverse of exponents.',
      'They are useful for solving equations involving powers.',
      'They also help model growth, decay, and scale in science and finance.',
    ],
    example:
      'If 10^2 = 100, then log10(100) = 2.',
    didYouKnow:
      'Logarithms were created to simplify very large and very small numbers in science and engineering.',
    takeaways: [
      'Logarithms reverse exponents.',
      'They simplify complex calculations.',
      'They help model growth and decay.',
    ],
    competencies: [
      {
        id: 'logarithm-basics',
        title: 'Logarithm basics',
        description: 'Understand how logarithms relate to exponential functions.',
        topicId: 'logarithms',
        lessonRef: 'logarithm-basics',
      },
      {
        id: 'logarithm-equations',
        title: 'Solving logarithmic equations',
        description: 'Apply logarithmic reasoning to solve equations and interpret results.',
        topicId: 'logarithms',
        lessonRef: 'logarithm-equations',
      },
    ],
    activity: {
      prompt: 'What is log10(100)?',
      options: ['1', '2', '10', '100'],
      correct: '2',
      explanation: 'Since 10^2 = 100, the logarithm base 10 of 100 is 2.',
      competencyId: 'logarithm-basics',
    },
    quiz: [
      {
        id: 'log-q1',
        question: 'Which equation is equivalent to log2(8) = 3?',
        options: ['2^3 = 8', '3^2 = 8', '8^2 = 3', '2 + 3 = 8'],
        correct: '2^3 = 8',
        explanation: 'Logarithms ask what exponent is needed: 2 raised to 3 equals 8.',
        competencyId: 'logarithm-basics',
      },
      {
        id: 'log-q2',
        question: 'What does a logarithm help you find?',
        options: ['The exponent in an exponential equation', 'The side length of a rectangle', 'The variable in a quadratic', 'The slope of a line'],
        correct: 'The exponent in an exponential equation',
        explanation: 'A logarithm is used to find the exponent when the base and value are known.',
        competencyId: 'logarithm-equations',
      },
      {
        id: 'log-q3',
        question: 'Why are logarithms useful?',
        options: ['They simplify very large or very small values', 'They replace all equations', 'They are only used in geometry', 'They are never used in real life'],
        correct: 'They simplify very large or very small values',
        explanation: 'Logarithms help manage huge ranges of values, especially in science and finance.',
        competencyId: 'logarithm-equations',
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
  currentQuizAnswerHistory: QuizAnswerRecord[] = [];
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
  coachPreview: LearningCoachRecommendation | null = null;
  coachRecommendation: LearningCoachRecommendation | null = null;
  aiChatOpen = false;
  aiChatLoading = false;
  aiChatInput = '';
  aiChatMessages: ChatMessage[] = [];
  private splashTimer: ReturnType<typeof setTimeout> | null = null;
  private backButtonListener: { remove: () => Promise<void> } | null = null;

  constructor(
    private readonly ngZone: NgZone,
    private readonly cdr: ChangeDetectorRef,
    private readonly learningCoachService: LearningCoachService,
    private readonly aiChatService: AiChatService,
  ) {}

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
    this.currentQuizAnswerHistory = [];
    this.coachPreview = this.learningCoachService.generateRecommendation(topic, this.currentQuizAnswerHistory);
    this.coachRecommendation = null;
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

    const isCorrect = this.selectedQuizAnswer === this.currentQuestion.correct;
    const competencyId = this.currentQuestion.competencyId ?? this.selectedTopic?.id ?? 'topic-review';

    this.currentQuizAnswerHistory.push({
      competencyId,
      isCorrect,
    });

    this.coachPreview = this.learningCoachService.generateRecommendation(this.selectedTopic ?? { id: 'topic', title: 'Topic' }, this.currentQuizAnswerHistory);

    if (isCorrect) {
      this.score += 1;
      this.correctAnswers += 1;
      this.quizFeedback = 'Correct! +1 point';
      this.quizExplanation = this.currentQuestion.explanation;
      return;
    }

    this.quizFeedback = 'Incorrect';
    this.quizExplanation = `Correct Answer: ${this.currentQuestion.correct}. ${this.currentQuestion.explanation} Coach tip: ${this.coachPreview.action}`;
  }

  retryQuestion(): void {
    this.selectedQuizAnswer = null;
    this.quizSubmitted = false;
    this.quizFeedback = '';
    this.quizExplanation = '';
    this.answerRequired = false;
    this.coachPreview = this.selectedTopic
      ? this.learningCoachService.generateRecommendation(this.selectedTopic, this.currentQuizAnswerHistory)
      : null;
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
    this.currentQuizAnswerHistory = [];
    this.coachPreview = this.selectedTopic
      ? this.learningCoachService.generateRecommendation(this.selectedTopic, this.currentQuizAnswerHistory)
      : null;
    this.coachRecommendation = null;
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
    this.currentQuizAnswerHistory = [];
    this.coachPreview = null;
    this.coachRecommendation = null;
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
    this.currentQuizAnswerHistory = [];
    this.coachPreview = null;
    this.coachRecommendation = null;
    this.screen = 'menu';
  }

  openProgress(): void {
    this.screen = 'progress';
  }

  openAiCoach(): void {
    this.aiChatOpen = true;

    if (!this.aiChatMessages.length) {
      const topicName = this.selectedTopic?.title ?? this.selectedSubject;
      this.aiChatMessages = [
        {
          role: 'assistant',
          text: `Hi! I’m your SciExplore PH coach. I can help you improve in ${topicName}. Ask me what feels hard, and I’ll suggest a study plan or explain the concept in a simpler way.`,
        },
      ];
    }
  }

  closeAiCoach(): void {
    this.aiChatOpen = false;
  }

  async sendAiCoachMessage(): Promise<void> {
    const trimmed = this.aiChatInput.trim();
    if (!trimmed || this.aiChatLoading) {
      return;
    }

    this.aiChatMessages.push({ role: 'user', text: trimmed });
    this.aiChatInput = '';
    this.aiChatLoading = true;

    try {
      const topicName = this.selectedTopic?.title ?? this.selectedSubject ?? 'your studies';
      const curriculumContext = this.selectedTopic?.curriculum
        ? {
            gradeLevel: this.selectedTopic.curriculum.gradeLevel,
            strand: this.selectedTopic.curriculum.strand,
            subject: this.selectedTopic.curriculum.subject,
            competencyStatement: this.selectedTopic.curriculum.competencyStatement,
            competencyCode: this.selectedTopic.curriculum.competencyCode,
            sourceTitle: this.selectedTopic.curriculum.source.title,
            sourceUrl: this.selectedTopic.curriculum.source.url,
          }
        : undefined;

      const reply = await this.aiChatService.sendMessage(trimmed, topicName, curriculumContext);
      this.aiChatMessages.push({ role: 'assistant', text: reply });
    } catch (error) {
      this.aiChatMessages.push({
        role: 'assistant',
        text: 'The AI coach timed out. I switched to local study guidance so you can keep learning without waiting.',
      });
      console.warn('AI coach request failed in the component layer.', error);
    } finally {
      this.aiChatLoading = false;
    }
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
    this.currentQuizAnswerHistory = [];
    this.coachPreview = null;
    this.coachRecommendation = null;
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
    this.coachRecommendation = this.learningCoachService.generateRecommendation(this.selectedTopic, this.currentQuizAnswerHistory);

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
      recommendation: this.coachRecommendation,
      completedAt: new Date().toISOString(),
    };

    this.topicResults = this.topicResults.filter((item) => item.topicId !== this.selectedTopic?.id);
    this.topicResults.push(result);
    this.persistProgress();

    this.screen = 'result';
  }
}