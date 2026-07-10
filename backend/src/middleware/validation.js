const { body, param, query, validationResult } = require('express-validator');

// Validation middleware factory
const validate = (req, res, next) => {
  const errors = validationResult(req);
  console.log('Validation middleware called for:', req.path);
  console.log('Request body:', req.body);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  console.log('Validation passed');
  next();
};

// Auth validation rules
const registerValidationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['admin', 'user', 'contributor', 'superadmin', 'editor']).withMessage('Invalid role')
];

const loginValidationRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// User validation rules
const updateUserValidationRules = [
  param('id')
    .isInt().withMessage('Invalid user ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['admin', 'user', 'contributor', 'superadmin', 'editor']).withMessage('Invalid role'),
  body('password')
    .optional()
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Story validation rules
const storyValidationRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required'),
  body('author_id')
    .optional()
    .isInt().withMessage('Invalid author ID'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Category must be less than 100 characters'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
  body('featured')
    .optional()
    .isBoolean().withMessage('Featured must be a boolean'),
  body('read_time')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Read time must be less than 50 characters')
];

const storyIdValidationRules = [
  param('id')
    .isInt().withMessage('Invalid story ID')
];

// Media validation rules
const mediaIdValidationRules = [
  param('id')
    .isInt().withMessage('Invalid media ID')
];

// Generic ID validation
const idValidationRules = [
  param('id')
    .isInt().withMessage('Invalid ID')
];

// Export validation middleware functions
const registerValidation = [...registerValidationRules, validate];
const loginValidation = [...loginValidationRules, validate];
const updateUserValidation = [...updateUserValidationRules, validate];
const storyValidation = [...storyValidationRules, validate];
const storyIdValidation = [...storyIdValidationRules, validate];
const mediaIdValidation = [...mediaIdValidationRules, validate];
const idValidation = [...idValidationRules, validate];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  updateUserValidation,
  storyValidation,
  storyIdValidation,
  mediaIdValidation,
  idValidation
};
