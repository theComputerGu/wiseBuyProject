import { Controller, Get, Param } from "@nestjs/common";
import { RecommendationsService } from "./recommendations.service";

@Controller("recommendations")
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService
  ) {}

  @Get(":userId")
  async getRecommendations(
    @Param("userId") userId: string
  ) {
    return this.recommendationsService.getByUserId(userId);
  }
}
