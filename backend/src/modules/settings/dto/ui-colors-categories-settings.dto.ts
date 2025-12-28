import { IsString } from 'class-validator';

export class UiColorsCategoriesSettingsDto {
  portfolioHomeColor!: string;
  logisticsHomeColor!: string;
  industryHomeColor!: string;
  constructionHomeColor!: string;
  lawyerHomeColor!: string;
  politicalHomeColor!: string;
  medicalHomeColor1!: string;
  medicalHomeColor2!: string;
  fruitsHomeColor!: string;
  fruitsHomeHeadingColor!: string;
  portfolioHomeDarkColor1!: string;
  portfolioHomeDarkColor2!: string;
  charityHomeColor!: string;
  designAgencyHomeColor!: string;
  cleaningHomeColor!: string;
  cleaningHomeColor2!: string;
  courseHomeColor!: string;
  courseHomeColor2!: string;
  groceryHomeColor!: string;
  groceryHomeColor2!: string;
}

export class UpdateUiColorsCategoriesSettingsDto {
  @IsString()
  portfolioHomeColor!: string;
  @IsString()
  logisticsHomeColor!: string;
  @IsString()
  industryHomeColor!: string;
  @IsString()
  constructionHomeColor!: string;
  @IsString()
  lawyerHomeColor!: string;
  @IsString()
  politicalHomeColor!: string;
  @IsString()
  medicalHomeColor1!: string;
  @IsString()
  medicalHomeColor2!: string;
  @IsString()
  fruitsHomeColor!: string;
  @IsString()
  fruitsHomeHeadingColor!: string;
  @IsString()
  portfolioHomeDarkColor1!: string;
  @IsString()
  portfolioHomeDarkColor2!: string;
  @IsString()
  charityHomeColor!: string;
  @IsString()
  designAgencyHomeColor!: string;
  @IsString()
  cleaningHomeColor!: string;
  @IsString()
  cleaningHomeColor2!: string;
  @IsString()
  courseHomeColor!: string;
  @IsString()
  courseHomeColor2!: string;
  @IsString()
  groceryHomeColor!: string;
  @IsString()
  groceryHomeColor2!: string;
}
