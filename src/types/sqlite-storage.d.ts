declare module "react-native-sqlite-storage" {
  export interface SQLError {
    code: number;
    message: string;
  }

  export interface ResultSet {
    insertId: number;
    rowsAffected: number;
    rows: {
      length: number;
      item(index: number): any;
      raw(): any[];
    };
  }

  export interface Transaction {
    executeSql(
      sqlStatement: string,
      arguments?: any[],
      success?: (transaction: Transaction, resultSet: ResultSet) => void,
      error?: (transaction: Transaction, error: SQLError) => void,
    ): void;
  }

  export interface SQLiteDatabase {
    transaction(
      callback: (tx: Transaction) => void,
      error?: (error: SQLError) => void,
      success?: () => void,
    ): void;
    close(): Promise<void>;
    executeSql(
      sqlStatement: string,
      arguments?: any[],
      success?: (resultSet: ResultSet) => void,
      error?: (error: SQLError) => void,
    ): void;
  }

  export interface DatabaseParams {
    name: string;
    location?: string;
    createFromLocation?: string;
  }

  export function enablePromise(enable: boolean): void;
  export function openDatabase(params: DatabaseParams): Promise<SQLiteDatabase>;

  const SQLite: {
    enablePromise: typeof enablePromise;
    openDatabase: typeof openDatabase;
  };

  export default SQLite;
}
