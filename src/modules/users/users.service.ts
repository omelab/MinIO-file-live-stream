import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './model/user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userModel.findOne({
      where: { email: createUserDto.email },
      paranoid: false, // Include soft-deleted records
    });

    if (existingUser) {
      if (existingUser.deletedAt) {
        // User was soft-deleted, restore it
        await existingUser.restore();
        return existingUser.reload();
      }
      throw new ConflictException('Email already exists');
    }

    return this.userModel.create(createUserDto);
  }

  async findAll(includeDeleted: boolean = false): Promise<User[]> {
    const options: any = {
      attributes: { exclude: ['password'] },
    };

    if (includeDeleted) {
      options.paranoid = false; // Include soft-deleted records
    }

    return this.userModel.findAll(options);
  }

  async findOne(id: number, includeDeleted: boolean = false): Promise<User> {
    const options: any = {
      attributes: { exclude: ['password'] },
    };

    if (includeDeleted) {
      options.paranoid = false;
    }

    const user = await this.userModel.findByPk(id, options);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(
    email: string,
    includeDeleted: boolean = false,
  ): Promise<User | null> {
    const options: any = {
      where: { email },
    };

    if (includeDeleted) {
      options.paranoid = false;
    }

    return this.userModel.findOne(options);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // If email is being updated, check for duplicates
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userModel.findOne({
        where: { email: updateUserDto.email },
        paranoid: false,
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    await user.update(updateUserDto);
    return user.reload({ attributes: { exclude: ['password'] } });
  }

  async remove(id: number): Promise<{ message: string }> {
    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await user.destroy();
    return { message: 'User soft deleted successfully' };
  }

  async restore(id: number): Promise<User> {
    const user = await this.userModel.findByPk(id, { paranoid: false });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (!user.deletedAt) {
      throw new BadRequestException(`User with ID ${id} is not deleted`);
    }

    await user.restore();
    return user.reload({ attributes: { exclude: ['password'] } });
  }

  async permanentDelete(id: number): Promise<{ message: string }> {
    const user = await this.userModel.findByPk(id, { paranoid: false });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await user.destroy({ force: true }); // Permanent delete
    return { message: 'User permanently deleted' };
  }

  async getDeletedUsers(): Promise<User[]> {
    const where: WhereOptions<User> = {
      deletedAt: {
        [Op.ne]: null,
      } as any,
    };

    return this.userModel.findAll({
      where,
      paranoid: false,
      attributes: { exclude: ['password'] },
    });
  }

  async searchUsers(
    searchTerm: string,
    includeDeleted: boolean = false,
  ): Promise<User[]> {
    const options: any = {
      where: {
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${searchTerm}%` } },
          { lastName: { [Op.iLike]: `%${searchTerm}%` } },
          { email: { [Op.iLike]: `%${searchTerm}%` } },
        ],
      },
      attributes: { exclude: ['password'] },
    };

    if (includeDeleted) {
      options.paranoid = false;
    }

    return this.userModel.findAll(options);
  }

  async updateLastLogin(userId: number): Promise<void> {
    await this.userModel.update(
      { lastLoginAt: new Date() },
      { where: { id: userId } },
    );
  }

  async findByStatus(
    status: string,
    includeDeleted: boolean = false,
  ): Promise<User[]> {
    const options: any = {
      where: { status },
      attributes: { exclude: ['password'] },
    };

    if (includeDeleted) {
      options.paranoid = false;
    }

    return this.userModel.findAll(options);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && (await user.validatePassword(password))) {
      return user;
    }
    return null;
  }

  async getUsersStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    deleted: number;
  }> {
    const total = await this.userModel.count();
    const active = await this.userModel.count({ where: { status: 'active' } });
    const inactive = await this.userModel.count({
      where: { status: 'inactive' },
    });
    const suspended = await this.userModel.count({
      where: { status: 'suspended' },
    });
    const deleted = await this.userModel.count({
      where: {
        deletedAt: { [Op.ne]: null },
      },
      paranoid: false,
    });

    return {
      total,
      active,
      inactive,
      suspended,
      deleted,
    };
  }
}
