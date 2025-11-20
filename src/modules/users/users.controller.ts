import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './model/user.model';
import { UsersService } from './users.service';

@ApiTags('Users Management')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Return all users' })
  async findAll(
    @Query('includeDeleted', new DefaultValuePipe(false))
    includeDeleted: boolean,
  ): Promise<User[]> {
    return this.usersService.findAll(includeDeleted);
  }

  @Get('deleted')
  @ApiOperation({ summary: 'Get all soft-deleted users' })
  @ApiResponse({ status: 200, description: 'Return all deleted users' })
  async getDeletedUsers(): Promise<User[]> {
    return this.usersService.getDeletedUsers();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get users statistics' })
  @ApiResponse({ status: 200, description: 'Return users statistics' })
  async getUsersStats() {
    return this.usersService.getUsersStats();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users by name or email' })
  @ApiQuery({ name: 'q', required: true, description: 'Search term' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Return search results' })
  async searchUsers(
    @Query('q') searchTerm: string,
    @Query('includeDeleted', new DefaultValuePipe(false))
    includeDeleted: boolean,
  ): Promise<User[]> {
    return this.usersService.searchUsers(searchTerm, includeDeleted);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get users by status' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Return users by status' })
  async findByStatus(
    @Param('status') status: string,
    @Query('includeDeleted', new DefaultValuePipe(false))
    includeDeleted: boolean,
  ): Promise<User[]> {
    return this.usersService.findByStatus(status, includeDeleted);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Return user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('includeDeleted', new DefaultValuePipe(false))
    includeDeleted: boolean,
  ): Promise<User> {
    return this.usersService.findOne(id, includeDeleted);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete user' })
  @ApiResponse({ status: 200, description: 'User soft deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.usersService.remove(id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore soft-deleted user' })
  @ApiResponse({ status: 200, description: 'User restored successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'User is not deleted' })
  async restore(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.restore(id);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete user' })
  @ApiResponse({ status: 200, description: 'User permanently deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async permanentDelete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.usersService.permanentDelete(id);
  }
}
