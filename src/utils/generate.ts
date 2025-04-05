import { Diff } from 'entity-diff';
import { JWTPayload } from 'src/dto/common-request.dto';
import { PageDto, PageMetaDto } from 'src/dto/paginate.dto';

export class GenerateUtil {
  static keyAuth = (payload: JWTPayload) => `auth_${payload.sub}_${payload.username}`;

  static randomDate = (start, end, startHour, endHour) => {
    const date = new Date(+start + Math.random() * (end - start));
    const hour = (startHour + Math.random() * (endHour - startHour)) | 0;
    date.setHours(hour);
    return date;
  };

  static randomFloat = (min: number, max: number, decimals: number = 0) => {
    const str = (Math.random() * (max - min) + min).toFixed(decimals);

    return parseFloat(str);
  };

  static keysFromDiff = (diff: Diff[]) => diff.map((item) => item.key).join(',');

  static paginate = ({ data, itemCount, query }): PageDto<any> => {
    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: query,
    });

    return new PageDto(data as any, pageMetaDto);
  };
}
