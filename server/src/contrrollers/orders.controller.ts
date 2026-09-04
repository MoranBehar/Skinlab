import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../DTO/orders/createOrder.dto';
import { UpdateOrderStatusDto } from '../DTO/orders/updateOrderStatus.dto';
import { JwtAuthGuard } from '../common/guards/jwtAuth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ----- PUBLIC/USER ROUTES -----

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.user_id, createOrderDto);
  }

  @Get()
  async getUserOrders(@Request() req) {
    return this.ordersService.getUserOrders(req.user.user_id);
  }

  @Get(':id')
  async getOrderById(
    @Request() req,
    @Param('id', ParseIntPipe) orderId: number,
  ) {
    return this.ordersService.getOrderById(orderId, req.user.user_id);
  }

  @Get(':id/tracking')
  async getOrderTracking(
    @Request() req,
    @Param('id', ParseIntPipe) orderId: number,
  ) {
    return this.ordersService.getOrderTracking(orderId, req.user.user_id);
  }

  @Patch(':id/status')
  async updateOrderStatus(
    @Request() req,
    @Param('id', ParseIntPipe) orderId: number,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(
      orderId,
      req.user.user_id,
      updateStatusDto,
    );
  }

  // ----- ADMIN ROUTES (Requires RolesGuard & @Roles(1)) -----

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(1)
  async getAllOrdersForAdmin(
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.ordersService.getAllOrdersForAdmin({
      status,
      startDate,
      endDate,
    });
  }

  @Get('admin/stats')
  @UseGuards(RolesGuard)
  @Roles(1)
  async getOrderStats() {
    return await this.ordersService.getOrderStats();
  }

  @Get('admin/revenue')
  @UseGuards(RolesGuard)
  @Roles(1)
  async getRevenueStats(
    @Query('period') period: 'day' | 'week' | 'month' | 'year' = 'week',
  ) {
    return await this.ordersService.getRevenueStats(period);
  }

  @Get('admin/recent')
  @UseGuards(RolesGuard)
  @Roles(1)
  async getRecentOrders(@Query('limit') limit: string = '10') {
    return await this.ordersService.getRecentOrders(parseInt(limit));
  }

  @Get('admin/:id')
  @UseGuards(RolesGuard)
  @Roles(1)
  async getOrderByIdForAdmin(@Param('id', ParseIntPipe) id: number) {
    return await this.ordersService.getOrderByIdForAdmin(id);
  }

  // user - cancalation only, admin - all
  @Patch('admin/:id/status')
  @UseGuards(RolesGuard)
  @Roles(1)
  async updateOrderStatusAdmin(
    @Param('id', ParseIntPipe) orderId: number,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatusAdmin(orderId, updateStatusDto);
  }
}
