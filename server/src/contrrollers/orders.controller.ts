import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../DTO/orders/createOrder.dto';
import { UpdateOrderStatusDto } from '../DTO/orders/updateOrderStatus.dto';
import { JwtAuthGuard } from '../common/guards/jwtAuth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // POST /orders
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @Request() req,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(req.user.user_id, createOrderDto);
  }

  // GET /orders
  @Get()
  async getUserOrders(@Request() req) {
    return this.ordersService.getUserOrders(req.user.user_id);
  }

  // GET /orders/:id
  @Get(':id')
  async getOrderById(
    @Request() req,
    @Param('id', ParseIntPipe) orderId: number,
  ) {
    return this.ordersService.getOrderById(orderId, req.user.user_id);
  }

  // GET /orders/:id/tracking
  @Get(':id/tracking')
  async getOrderTracking(
    @Request() req,
    @Param('id', ParseIntPipe) orderId: number,
  ) {
    return this.ordersService.getOrderTracking(orderId, req.user.user_id);
  }

  /**
   * PATCH /orders/:id/status
   */
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
}