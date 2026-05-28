// styled-components DefaultTheme 타입 확장
// 이 파일이 없으면 theme 속성에 TS 타입 오류 발생
import 'styled-components';
import { Theme } from './theme';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
