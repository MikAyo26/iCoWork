import { IsInt, IsISO8601, Min } from 'class-validator';

export class UnirseListaEsperaDto {
  @IsInt()
  @Min(1)
  espacioId: number;

  @IsISO8601()
  fechaDeseada: string;
}
