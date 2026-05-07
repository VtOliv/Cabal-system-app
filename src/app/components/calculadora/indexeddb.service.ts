// indexeddb.service.ts
// Serviço para salvar e recuperar o último cálculo usando IndexedDB

export class IndexedDBService {
  private dbName = 'CalculadoraDB';
  private storeName = 'calculos';

  private getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async salvarUltimoCalculo(calculo: any): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, 'readwrite');
    const store = tx.objectStore(this.storeName);
    store.put({ id: 'ultimo', ...calculo });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async recuperarUltimoCalculo(): Promise<any> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, 'readonly');
    const store = tx.objectStore(this.storeName);
    return new Promise((resolve, reject) => {
      const request = store.get('ultimo');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
