import { Body, Controller, Post, Res, Get, Param, Put } from '@nestjs/common';
import { ConfigService } from './config.service';
import type { Response } from 'express';
import { CreateConfigDto } from './create-config.dto';
import { ConfigResponseDto, ConfigIdResponseDto } from './config-response.dto';
import { ApiOperation, ApiParam, ApiOkResponse, ApiTags, ApiBody, ApiConsumes, ApiProduces, ApiNotFoundResponse, ApiBadRequestResponse } from '@nestjs/swagger';

@ApiTags('Configuration Management')
@Controller('api/config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Post()
  @ApiOperation({
    summary: 'Save meme configuration',
    description: `**Description**

    API to save a new meme configuration with styling options. This will:
    1. Validate the provided configuration data
    2. Store the configuration in the database
    3. Return a unique configuration ID for future reference

    **Use Cases:**
    - Save user's preferred meme styling settings
    - Create reusable configuration templates
    - Store configuration for later meme generation

    **Configuration Options:**
    - Text styling (font, size, color, stroke)
    - Text alignment and positioning
    - Watermark settings
    - Image processing parameters

    **Note:** All fields are optional. Default values will be applied for missing fields.`,
  })
  @ApiBody({
    type: CreateConfigDto,
    description: 'Meme configuration data'
  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiOkResponse({
    description: 'Successfully saved configuration',
    type: ConfigIdResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid configuration data provided'
  })
  async saveConfig(@Body() body: CreateConfigDto): Promise<ConfigIdResponseDto> {
    const configId = await this.configService.saveConfig(body);
    return { id: configId };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get configuration by ID',
    description: `**Description**

    API to retrieve a saved meme configuration by its unique identifier. This will:
    1. Look up the configuration in the database
    2. Return the complete configuration data
    3. Include timestamps for creation and last update

    **Use Cases:**
    - Load previously saved configurations
    - Apply saved settings to new memes
    - Display configuration details in UI
    - Validate configuration existence

    **Response includes:**
    - All configuration parameters
    - Creation and update timestamps
    - Unique configuration identifier

    **Note:** Returns 404 if configuration with the specified ID is not found.`,
  })
  @ApiParam({
    name: 'id',
    description: 'Unique configuration identifier',
    example: 'config-123'
  })
  @ApiOkResponse({
    description: 'Successfully retrieved configuration',
    type: ConfigResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Configuration not found'
  })
  async getConfigById(@Param('id') id: string): Promise<ConfigResponseDto> {
    return this.configService.getConfigById(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update configuration',
    description: `**Description**

    API to update an existing meme configuration with new settings. This will:
    1. Validate the provided configuration data
    2. Merge new settings with existing configuration
    3. Update the configuration in the database
    4. Return the updated configuration

    **Use Cases:**
    - Modify existing configuration settings
    - Update user preferences
    - Refine configuration templates
    - Apply incremental changes

    **Update Behavior:**
    - Only provided fields will be updated
    - Missing fields retain their existing values
    - Validation applies to all provided fields
    - Timestamps are automatically updated

    **Note:** Returns 404 if configuration with the specified ID is not found.`,
  })
  @ApiParam({
    name: 'id',
    description: 'Unique configuration identifier',
    example: 'config-123'
  })
  @ApiBody({
    type: CreateConfigDto,
    description: 'Updated configuration data (only provided fields will be updated)'
  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiOkResponse({
    description: 'Successfully updated configuration',
    type: ConfigResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Configuration not found'
  })
  @ApiBadRequestResponse({
    description: 'Invalid configuration data provided'
  })
  async updateConfig(@Param('id') id: string, @Body() body: CreateConfigDto): Promise<ConfigResponseDto> {
    return this.configService.updateConfig(id, body);
  }
}