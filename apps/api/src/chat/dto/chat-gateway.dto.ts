import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class JoinConversationDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  messageType?: string;
}
