declare module 'ics-js' {
  export class VCALENDAR {
    addProp(name: string, value: any): void;
    addComponent(component: VEVENT): void;
    toString(): string;
  }

  export class VEVENT {
    addProp(name: string, value: any): void;
  }
} 