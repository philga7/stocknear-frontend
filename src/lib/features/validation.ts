import type { ExtendedFeatureFlag } from './config';

// Validation schema for feature flags
export interface ValidationSchema {
  name: string;
  type: 'string' | 'boolean' | 'number' | 'object' | 'array';
  required: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  nested?: ValidationSchema[];
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

// Validation error interface
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'critical';
}

// Validation warning interface
export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  suggestion?: string;
}

// Feature flag validation schema
export const featureFlagSchema: ValidationSchema[] = [
  {
    name: 'name',
    type: 'string',
    required: true,
    min: 1,
    max: 100
  },
  {
    name: 'enabled',
    type: 'boolean',
    required: true
  },
  {
    name: 'category',
    type: 'string',
    required: true,
    enum: ['dashboard', 'widget', 'action', 'news', 'component']
  },
  {
    name: 'defaultValue',
    type: 'boolean',
    required: true
  },
  {
    name: 'description',
    type: 'string',
    required: false,
    max: 500
  },
  {
    name: 'userOverride',
    type: 'boolean',
    required: false
  },
  {
    name: 'version',
    type: 'string',
    required: true,
    pattern: /^\d+\.\d+\.\d+$/
  },
  {
    name: 'lastModified',
    type: 'object',
    required: true
  },
  {
    name: 'createdBy',
    type: 'string',
    required: true,
    min: 1
  }
];

// Rollout configuration validation schema
export const rolloutSchema: ValidationSchema[] = [
  {
    name: 'percentage',
    type: 'number',
    required: true,
    min: 0,
    max: 100
  },
  {
    name: 'startDate',
    type: 'object',
    required: true
  },
  {
    name: 'endDate',
    type: 'object',
    required: false
  },
  {
    name: 'targetUsers',
    type: 'array',
    required: false
  },
  {
    name: 'gradualRollout',
    type: 'boolean',
    required: true
  }
];

// Admin configuration validation schema
export const adminSchema: ValidationSchema[] = [
  {
    name: 'adminOverride',
    type: 'boolean',
    required: true
  },
  {
    name: 'adminUserId',
    type: 'string',
    required: false,
    min: 1
  },
  {
    name: 'adminPermissions',
    type: 'array',
    required: false
  },
  {
    name: 'auditLog',
    type: 'boolean',
    required: true
  }
];

// Dependency configuration validation schema
export const dependencySchema: ValidationSchema[] = [
  {
    name: 'requiredFeatures',
    type: 'array',
    required: false
  },
  {
    name: 'optionalFeatures',
    type: 'array',
    required: false
  },
  {
    name: 'conflicts',
    type: 'array',
    required: false
  },
  {
    name: 'priority',
    type: 'string',
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  }
];

// Analytics configuration validation schema
export const analyticsSchema: ValidationSchema[] = [
  {
    name: 'trackUsage',
    type: 'boolean',
    required: true
  },
  {
    name: 'trackPerformance',
    type: 'boolean',
    required: true
  },
  {
    name: 'trackErrors',
    type: 'boolean',
    required: true
  },
  {
    name: 'customMetrics',
    type: 'array',
    required: false
  }
];

// Environment configuration validation schema
export const environmentSchema: ValidationSchema[] = [
  {
    name: 'development',
    type: 'boolean',
    required: true
  },
  {
    name: 'production',
    type: 'boolean',
    required: true
  },
  {
    name: 'staging',
    type: 'boolean',
    required: true
  },
  {
    name: 'testing',
    type: 'boolean',
    required: true
  }
];

// Validate a single field against its schema
export const validateField = (
  value: any,
  schema: ValidationSchema,
  fieldPath: string = ''
): ValidationError[] => {
  const errors: ValidationError[] = [];
  const fullFieldPath = fieldPath ? `${fieldPath}.${schema.name}` : schema.name;

  // Check if required field is present
  if (schema.required && (value === undefined || value === null)) {
    errors.push({
      field: fullFieldPath,
      message: `Required field "${schema.name}" is missing`,
      code: 'REQUIRED_FIELD_MISSING',
      severity: 'error'
    });
    return errors;
  }

  // Skip validation if value is not required and not present
  if (!schema.required && (value === undefined || value === null)) {
    return errors;
  }

  // Type validation
  switch (schema.type) {
    case 'string':
      if (typeof value !== 'string') {
        errors.push({
          field: fullFieldPath,
          message: `Field "${schema.name}" must be a string`,
          code: 'INVALID_TYPE',
          severity: 'error'
        });
      } else {
        if (schema.min && value.length < schema.min) {
          errors.push({
            field: fullFieldPath,
            message: `Field "${schema.name}" must be at least ${schema.min} characters long`,
            code: 'MIN_LENGTH_VIOLATION',
            severity: 'error'
          });
        }
        if (schema.max && value.length > schema.max) {
          errors.push({
            field: fullFieldPath,
            message: `Field "${schema.name}" must be no more than ${schema.max} characters long`,
            code: 'MAX_LENGTH_VIOLATION',
            severity: 'error'
          });
        }
        if (schema.pattern && !schema.pattern.test(value)) {
          errors.push({
            field: fullFieldPath,
            message: `Field "${schema.name}" does not match required pattern`,
            code: 'PATTERN_VIOLATION',
            severity: 'error'
          });
        }
        if (schema.enum && !schema.enum.includes(value)) {
          errors.push({
            field: fullFieldPath,
            message: `Field "${schema.name}" must be one of: ${schema.enum.join(', ')}`,
            code: 'ENUM_VIOLATION',
            severity: 'error'
          });
        }
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean') {
        errors.push({
          field: fullFieldPath,
          message: `Field "${schema.name}" must be a boolean`,
          code: 'INVALID_TYPE',
          severity: 'error'
        });
      }
      break;

    case 'number':
      if (typeof value !== 'number') {
        errors.push({
          field: fullFieldPath,
          message: `Field "${schema.name}" must be a number`,
          code: 'INVALID_TYPE',
          severity: 'error'
        });
      } else {
        if (schema.min !== undefined && value < schema.min) {
          errors.push({
            field: fullFieldPath,
            message: `Field "${schema.name}" must be at least ${schema.min}`,
            code: 'MIN_VALUE_VIOLATION',
            severity: 'error'
          });
        }
        if (schema.max !== undefined && value > schema.max) {
          errors.push({
            field: fullFieldPath,
            message: `Field "${schema.name}" must be no more than ${schema.max}`,
            code: 'MAX_VALUE_VIOLATION',
            severity: 'error'
          });
        }
      }
      break;

    case 'array':
      if (!Array.isArray(value)) {
        errors.push({
          field: fullFieldPath,
          message: `Field "${schema.name}" must be an array`,
          code: 'INVALID_TYPE',
          severity: 'error'
        });
      } else if (schema.nested) {
        // Validate array items against nested schema
        value.forEach((item, index) => {
          schema.nested!.forEach(nestedSchema => {
            errors.push(...validateField(item, nestedSchema, `${fullFieldPath}[${index}]`));
          });
        });
      }
      break;

    case 'object':
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        errors.push({
          field: fullFieldPath,
          message: `Field "${schema.name}" must be an object`,
          code: 'INVALID_TYPE',
          severity: 'error'
        });
      } else if (schema.nested) {
        // Validate object properties against nested schema
        schema.nested.forEach(nestedSchema => {
          errors.push(...validateField(value[nestedSchema.name], nestedSchema, fullFieldPath));
        });
      }
      break;
  }

  return errors;
};

// Validate a feature flag against its schema
export const validateFeatureFlag = (flag: ExtendedFeatureFlag): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Validate basic feature flag properties
  featureFlagSchema.forEach(schema => {
    errors.push(...validateField(flag[schema.name as keyof ExtendedFeatureFlag], schema));
  });

  // Validate rollout configuration if present
  if (flag.rollout) {
    rolloutSchema.forEach(schema => {
      errors.push(...validateField(flag.rollout![schema.name as keyof typeof flag.rollout], schema, 'rollout'));
    });
  }

  // Validate admin configuration if present
  if (flag.admin) {
    adminSchema.forEach(schema => {
      errors.push(...validateField(flag.admin![schema.name as keyof typeof flag.admin], schema, 'admin'));
    });
  }

  // Validate dependency configuration if present
  if (flag.dependencies) {
    dependencySchema.forEach(schema => {
      errors.push(...validateField(flag.dependencies![schema.name as keyof typeof flag.dependencies], schema, 'dependencies'));
    });
  }

  // Validate analytics configuration if present
  if (flag.analytics) {
    analyticsSchema.forEach(schema => {
      errors.push(...validateField(flag.analytics![schema.name as keyof typeof flag.analytics], schema, 'analytics'));
    });
  }

  // Validate environment configuration if present
  if (flag.environment) {
    environmentSchema.forEach(schema => {
      errors.push(...validateField(flag.environment![schema.name as keyof typeof flag.environment], schema, 'environment'));
    });
  }

  // Additional business logic validations
  if (flag.rollout) {
    if (flag.rollout.startDate >= (flag.rollout.endDate || new Date())) {
      errors.push({
        field: 'rollout.dateRange',
        message: 'Rollout start date must be before end date',
        code: 'INVALID_DATE_RANGE',
        severity: 'error'
      });
    }

    if (flag.rollout.percentage === 0 && flag.rollout.targetUsers.length === 0) {
      warnings.push({
        field: 'rollout',
        message: 'Rollout is set to 0% with no target users - feature will be disabled',
        code: 'ROLLOUT_DISABLED',
        suggestion: 'Consider setting a rollout percentage or adding target users'
      });
    }
  }

  if (flag.dependencies?.requiredFeatures.length === 0 && flag.dependencies?.optionalFeatures.length === 0) {
    warnings.push({
      field: 'dependencies',
      message: 'No dependencies defined - consider adding required or optional features',
      code: 'NO_DEPENDENCIES',
      suggestion: 'Add required or optional feature dependencies for better organization'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Validate a complete configuration object
export const validateConfiguration = (config: Record<string, ExtendedFeatureFlag>): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Validate each feature flag
  Object.entries(config).forEach(([key, flag]) => {
    const result = validateFeatureFlag(flag);
    errors.push(...result.errors.map(error => ({
      ...error,
      field: `${key}.${error.field}`
    })));
    warnings.push(...result.warnings.map(warning => ({
      ...warning,
      field: `${key}.${warning.field}`
    })));
  });

  // Cross-feature validations
  const featureNames = Object.keys(config);
  
  // Check for duplicate names
  const names = Object.values(config).map(flag => flag.name);
  const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index);
  
  if (duplicateNames.length > 0) {
    errors.push({
      field: 'configuration',
      message: `Duplicate feature names found: ${duplicateNames.join(', ')}`,
      code: 'DUPLICATE_NAMES',
      severity: 'error'
    });
  }

  // Check for circular dependencies
  const circularDeps = findCircularDependencies(config);
  if (circularDeps.length > 0) {
    errors.push({
      field: 'dependencies',
      message: `Circular dependencies detected: ${circularDeps.join(', ')}`,
      code: 'CIRCULAR_DEPENDENCIES',
      severity: 'critical'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Find circular dependencies in feature configuration
export const findCircularDependencies = (config: Record<string, ExtendedFeatureFlag>): string[] => {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const circularDeps: string[] = [];

  const dfs = (featureName: string, path: string[] = []): boolean => {
    if (recursionStack.has(featureName)) {
      const cycle = [...path, featureName];
      circularDeps.push(cycle.join(' -> '));
      return true;
    }

    if (visited.has(featureName)) {
      return false;
    }

    visited.add(featureName);
    recursionStack.add(featureName);

    const feature = config[featureName];
    if (feature?.dependencies?.requiredFeatures) {
      for (const dep of feature.dependencies.requiredFeatures) {
        if (config[dep]) {
          dfs(dep, [...path, featureName]);
        }
      }
    }

    recursionStack.delete(featureName);
    return false;
  };

  Object.keys(config).forEach(featureName => {
    if (!visited.has(featureName)) {
      dfs(featureName);
    }
  });

  return circularDeps;
};

// Validate configuration against environment constraints
export const validateEnvironmentConstraints = (
  config: Record<string, ExtendedFeatureFlag>,
  environment: string
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  Object.entries(config).forEach(([key, flag]) => {
    if (flag.environment) {
      const envKey = environment as keyof typeof flag.environment;
      if (!flag.environment[envKey]) {
        warnings.push({
          field: `${key}.environment`,
          message: `Feature "${flag.name}" is not enabled for environment "${environment}"`,
          code: 'ENVIRONMENT_DISABLED',
          suggestion: 'Consider enabling this feature for the current environment'
        });
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Generate validation report
export const generateValidationReport = (result: ValidationResult): string => {
  let report = 'Feature Configuration Validation Report\n';
  report += '==========================================\n\n';

  if (result.isValid) {
    report += '✅ Configuration is valid\n\n';
  } else {
    report += '❌ Configuration has errors\n\n';
  }

  if (result.errors.length > 0) {
    report += 'Errors:\n';
    result.errors.forEach(error => {
      report += `  • ${error.field}: ${error.message} (${error.code})\n`;
    });
    report += '\n';
  }

  if (result.warnings.length > 0) {
    report += 'Warnings:\n';
    result.warnings.forEach(warning => {
      report += `  • ${warning.field}: ${warning.message} (${warning.code})\n`;
      if (warning.suggestion) {
        report += `    Suggestion: ${warning.suggestion}\n`;
      }
    });
    report += '\n';
  }

  return report;
}; 