// users/user.model.ts
import * as bcrypt from 'bcrypt';
import {
  AutoIncrement, // Keep Unique for unique constraints
  BeforeCreate,
  BeforeUpdate,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';

interface UserCreationAttributes {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  status?: string;
  isEmailVerified?: boolean;
  lastLoginAt?: Date;
  profilePicture?: string;
  role?: string;
  metadata?: Record<string, any>;
  tags?: string[];
}

@Table({
  tableName: 'users',
  underscored: true,
  timestamps: true,
  paranoid: true,
})
export class User extends Model<User, UserCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  declare id: number;

  // Remove @Index decorator
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'First name is required',
      },
      len: {
        args: [2, 100],
        msg: 'First name must be between 2 and 100 characters',
      },
    },
  })
  declare firstName: string;

  // Remove @Index decorator
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Last name is required',
      },
      len: {
        args: [2, 100],
        msg: 'Last name must be between 2 and 100 characters',
      },
    },
  })
  declare lastName: string;

  // Virtual field for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @Unique // Keep Unique for email uniqueness
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: {
      isEmail: {
        msg: 'Please provide a valid email address',
      },
      notEmpty: {
        msg: 'Email is required',
      },
    },
  })
  declare email: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Password is required',
      },
      len: {
        args: [6, 255],
        msg: 'Password must be at least 6 characters long',
      },
    },
  })
  declare password: string;

  @Column({
    type: DataType.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active',
    validate: {
      isIn: {
        args: [['active', 'inactive', 'suspended']],
        msg: 'Status must be active, inactive, or suspended',
      },
    },
  })
  declare status: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isEmailVerified: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare lastLoginAt: Date;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare profilePicture: string;

  @Column({
    type: DataType.ENUM('user', 'admin', 'moderator'),
    defaultValue: 'user',
    validate: {
      isIn: {
        args: [['user', 'admin', 'moderator']],
        msg: 'Role must be user, admin, or moderator',
      },
    },
  })
  declare role: string;

  @Column({
    type: DataType.JSONB,
    defaultValue: {},
  })
  declare metadata: Record<string, any>;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [],
  })
  declare tags: string[];

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: Date;

  @DeletedAt
  @Column(DataType.DATE)
  declare deletedAt: Date | null;

  // Hooks
  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(user: User) {
    if (user.changed('password')) {
      const saltRounds = 12;
      user.password = await bcrypt.hash(user.password, saltRounds);
    }
  }

  // Instance methods
  async validatePassword(password: string): Promise<boolean> {
    try {
      if (!password || !this.password) {
        return false;
      }
      const isValid: boolean = await bcrypt.compare(password, this.password);
      return isValid;
    } catch (error) {
      console.error('Password validation error:', error);
      return false;
    }
  }

  toJSON() {
    const values = { ...this.get() } as Partial<User> & Record<string, any>;
    delete values.password;
    return values;
  }
}
