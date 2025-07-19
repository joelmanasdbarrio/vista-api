import { Context } from "hono";
import BaseRepository from "../../base.repository";
import ActivityCategoryMapper from "./activityCategory.mapper";
import { activity_category } from "../../../db/schema";
import { ActivityCategoryDTO } from "../../../types/vista-spec.types";
import Logger, { LogLabels } from "../../../utils/logger";

export default class ActivityCategoryRepository extends BaseRepository {
  protected resource = 'ActivityCategory'

  constructor(c: Context) {
    super(c)
  }

  /**
   * @deprecated
   */
  async getAllPaginated(query: any): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async getAll(): Promise<{ activityCategories: ActivityCategoryDTO[] }> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getAllPaginated' }
    Logger.info('Get all Activity Categories documents', labels)

    const activityCategoriesDB: typeof activity_category.$inferSelect[] = await this.drizzle
      .select()
      .from(activity_category)

    const activityCategoryDTOs = await ActivityCategoryMapper.toDTOs(activityCategoriesDB);

    return {
      activityCategories: activityCategoryDTOs
    };
  }

  /**
   * @deprecated
   */
  async getOneById(id: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  /**
   * @deprecated
   */
  async createOne(data: any): Promise<any> {
    throw new Error("Method not implemented.");
  }

  /**
   * @deprecated
   */
  async updateOneById(id: string, data: any, obj: any): Promise<any> {
    throw new Error("Method not implemented.");
  }

  /**
   * @deprecated
   */
  async deleteOneById(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}