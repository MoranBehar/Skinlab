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
  BadRequestException,
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
    return this.ordersService.createOrder(req.user.userId, createOrderDto);
  }

  // GET /orders
  @Get()
  async getUserOrders(@Request() req) {
    return this.ordersService.getUserOrders(req.user.userId);
  }

  // GET /orders/:id
  @Get(':id')
  async getOrderById(
    @Request() req,
    @Param('id', ParseIntPipe) orderId: number,
  ) {
    return this.ordersService.getOrderById(orderId, req.user.userId);
  }

  // GET /orders/:id/tracking
  @Get(':id/tracking')
  async getOrderTracking(
    @Request() req,
    @Param('id', ParseIntPipe) orderId: number,
  ) {
    return this.ordersService.getOrderTracking(orderId, req.user.userId);
  }

  /**
   * PATCH /orders/:id/status
   * Only for managers (role_id = 1)
   */
  @Patch(':id/status')
  async updateOrderStatus(
    @Request() req,
    @Param('id', ParseIntPipe) orderId: number,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {

    // Checking that the user is an admin
    if (req.user.roleId !== 1) {
        throw new BadRequestException('Only managers can update status');
    }

    return this.ordersService.updateOrderStatus(
      orderId,
      req.user.userId,
      updateStatusDto,
    );
  }
}