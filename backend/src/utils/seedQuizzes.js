// seedQuizzes.js - Add sample quizzes to database
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
require('dotenv').config();

const sampleQuizzes = [
  {
    title: 'JavaScript Basics',
    topic: 'JavaScript Fundamentals',
    subject: 'web-dev',
    difficulty: 'easy',
    questions: [
      {
        question: 'What does "var" stand for in JavaScript?',
        options: ['Variable', 'Variant', 'Variation', 'Varies'],
        correctAnswer: 'Variable'
      },
      {
        question: 'Which symbol is used for single-line comments?',
        options: ['//', '/* */', '#', '--'],
        correctAnswer: '//'
      },
      {
        question: 'What is the correct way to declare a constant?',
        options: ['const x = 5;', 'constant x = 5;', 'let x = 5;', 'var x = 5;'],
        correctAnswer: 'const x = 5;'
      }
    ],
    createdByAI: false
  },
  {
    title: 'React Fundamentals',
    topic: 'React Basics',
    subject: 'web-dev',
    difficulty: 'medium',
    questions: [
      {
        question: 'What is JSX?',
        options: ['JavaScript XML', 'Java Syntax Extension', 'JSON Extension', 'JavaScript Express'],
        correctAnswer: 'JavaScript XML'
      },
      {
        question: 'Which hook is used for side effects?',
        options: ['useEffect', 'useState', 'useContext', 'useMemo'],
        correctAnswer: 'useEffect'
      },
      {
        question: 'What does useState return?',
        options: ['Array with state and setter', 'Object', 'Function', 'String'],
        correctAnswer: 'Array with state and setter'
      }
    ],
    createdByAI: false
  },
  {
    title: 'Python Basics',
    topic: 'Python Programming',
    subject: 'programming',
    difficulty: 'easy',
    questions: [
      {
        question: 'What is the correct file extension for Python files?',
        options: ['.py', '.python', '.pt', '.pyt'],
        correctAnswer: '.py'
      },
      {
        question: 'Which keyword is used to define a function?',
        options: ['def', 'function', 'func', 'define'],
        correctAnswer: 'def'
      },
      {
        question: 'How do you start a comment in Python?',
        options: ['#', '//', '/*', '--'],
        correctAnswer: '#'
      }
    ],
    createdByAI: false
  },
  {
    title: 'Data Structures',
    topic: 'Arrays and Lists',
    subject: 'programming',
    difficulty: 'hard',
    questions: [
      {
        question: 'What is the time complexity of binary search?',
        options: ['O(log n)', 'O(n)', 'O(n^2)', 'O(1)'],
        correctAnswer: 'O(log n)'
      },
      {
        question: 'Which data structure uses LIFO?',
        options: ['Stack', 'Queue', 'Array', 'Linked List'],
        correctAnswer: 'Stack'
      },
      {
        question: 'What is a hash collision?',
        options: ['Two keys mapping to same index', 'Memory overflow', 'Key not found', 'Index out of bounds'],
        correctAnswer: 'Two keys mapping to same index'
      }
    ],
    createdByAI: false
  },
  {
    title: 'Biology 101',
    topic: 'Cell Biology',
    subject: 'science',
    difficulty: 'easy',
    questions: [
      {
        question: 'What is the powerhouse of the cell?',
        options: ['Mitochondria', 'Nucleus', 'Ribosome', 'Chloroplast'],
        correctAnswer: 'Mitochondria'
      },
      {
        question: 'What is DNA?',
        options: ['Deoxyribonucleic Acid', 'Dynamic Nucleic Acid', 'Dual Nuclear Acid', 'Dense Nucleic Atom'],
        correctAnswer: 'Deoxyribonucleic Acid'
      },
      {
        question: 'Which organelle contains genetic material?',
        options: ['Nucleus', 'Cytoplasm', 'Cell membrane', 'Vacuole'],
        correctAnswer: 'Nucleus'
      }
    ],
    createdByAI: false
  },
  {
    title: 'Physics Advanced',
    topic: 'Quantum Mechanics',
    subject: 'science',
    difficulty: 'hard',
    questions: [
      {
        question: 'What is the uncertainty principle?',
        options: ['Cannot know position and momentum precisely', 'Energy is uncertain', 'Time is relative', 'Mass varies'],
        correctAnswer: 'Cannot know position and momentum precisely'
      },
      {
        question: 'What is a photon?',
        options: ['Particle of light', 'Type of electron', 'Wave function', 'Quantum state'],
        correctAnswer: 'Particle of light'
      },
      {
        question: 'Who developed quantum mechanics?',
        options: ['Multiple scientists', 'Einstein', 'Newton', 'Bohr'],
        correctAnswer: 'Multiple scientists'
      }
    ],
    createdByAI: false
  },
  {
    title: 'World History',
    topic: 'Ancient Civilizations',
    subject: 'history',
    difficulty: 'medium',
    questions: [
      {
        question: 'Which civilization built the pyramids?',
        options: ['Ancient Egypt', 'Ancient Greece', 'Roman Empire', 'Mayans'],
        correctAnswer: 'Ancient Egypt'
      },
      {
        question: 'When did World War II end?',
        options: ['1945', '1944', '1946', '1943'],
        correctAnswer: '1945'
      },
      {
        question: 'Who was the first Roman Emperor?',
        options: ['Augustus', 'Julius Caesar', 'Nero', 'Constantine'],
        correctAnswer: 'Augustus'
      }
    ],
    createdByAI: false
  },
  {
    title: 'CSS Flexbox',
    topic: 'CSS Layouts',
    subject: 'web-dev',
    difficulty: 'medium',
    questions: [
      {
        question: 'What property makes an element a flex container?',
        options: ['display: flex', 'flex: 1', 'flex-container: true', 'flexbox: on'],
        correctAnswer: 'display: flex'
      },
      {
        question: 'What does justify-content control?',
        options: ['Main axis alignment', 'Cross axis alignment', 'Item size', 'Item order'],
        correctAnswer: 'Main axis alignment'
      },
      {
        question: 'Which property controls item wrapping?',
        options: ['flex-wrap', 'flex-flow', 'wrap-items', 'flex-break'],
        correctAnswer: 'flex-wrap'
      }
    ],
    createdByAI: false
  }
];

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI not found in .env file');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✓ Connected to MongoDB');

    // Clear existing quizzes (optional)
    console.log('Clearing existing quizzes...');
    await Quiz.deleteMany({});
    console.log('✓ Cleared existing quizzes');

    // Insert sample quizzes
    console.log('Inserting sample quizzes...');
    const result = await Quiz.insertMany(sampleQuizzes);
    console.log(`✓ Successfully added ${result.length} quizzes to database`);

    console.log('\nQuizzes added:');
    result.forEach((quiz, index) => {
      console.log(`${index + 1}. ${quiz.title} (${quiz.difficulty}) - ${quiz.questions.length} questions`);
    });

    console.log('\n✅ Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
