import { Body, Route, Tags, Post } from "tsoa";

export interface PingRequest {
    hello: string
}

interface PingResponse {
  message: string;
}

@Route("ping")
@Tags("Ping")
export default class PingController {
  @Post("/")
  public async getMessage(@Body() a: PingRequest): Promise<PingResponse> {
    return {
      message: "pong",
    };
  }
}