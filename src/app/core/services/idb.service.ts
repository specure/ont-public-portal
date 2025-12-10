import { Injectable } from '@angular/core'
import { IPaginator } from '../interfaces/paginator.interface'
import { ISort } from '../interfaces/sort.interface'

export interface IListResult<T> {
  data: T[]
  total: number
}

@Injectable({
  providedIn: 'root',
})
export class IdbService {
  connect(
    dbName: string,
    objectStoreName?: string,
    options?: IDBObjectStoreParameters
  ): Promise<IDBDatabase> {
    if (!('indexedDB' in globalThis)) {
      return Promise.reject('IndexedDB is not supported in this browser.')
    }
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(dbName, 1)

      request.onerror = () => {
        reject('Failed to open IndexedDB.')
      }

      request.onsuccess = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(objectStoreName ?? dbName)) {
          db.close()
          indexedDB.deleteDatabase(dbName)
          this.connect(dbName, objectStoreName, options)
          reject('Object store does not exist.')
          return
        }
        resolve(db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result as IDBDatabase
        if (!db.objectStoreNames.contains(objectStoreName ?? dbName)) {
          db.createObjectStore(
            objectStoreName ?? dbName,
            options ?? { keyPath: 'id' }
          )
        }
      }
    })
  }

  getData<T>(
    db: IDBDatabase,
    storeName: string,
    key: IDBValidKey
  ): Promise<T | undefined> {
    return new Promise<T | undefined>((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly')
      const objectStore = transaction.objectStore(storeName)
      const request = objectStore.get(key)

      request.onsuccess = () => {
        resolve(request.result as T | undefined)
      }

      request.onerror = () => {
        reject('Failed to retrieve data from IndexedDB.')
      }
    })
  }

  putData<T>(db: IDBDatabase, storeName: string, data: T): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const objectStore = transaction.objectStore(storeName)
      const request = objectStore.put(data)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject('Failed to store data in IndexedDB.')
      }
    })
  }

  deleteData(
    db: IDBDatabase,
    storeName: string,
    key: IDBValidKey
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const objectStore = transaction.objectStore(storeName)
      const request = objectStore.delete(key)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject('Failed to delete data from IndexedDB.')
      }
    })
  }

  clearStore(db: IDBDatabase, storeName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const objectStore = transaction.objectStore(storeName)
      const request = objectStore.clear()

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject('Failed to clear data from IndexedDB.')
      }
    })
  }

  getList<T>(
    db: IDBDatabase,
    storeName: string,
    paginator: IPaginator,
    sort: ISort,
    filter?: (item: T) => boolean
  ): Promise<IListResult<T>> {
    return new Promise<IListResult<T>>((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly')
      const objectStore = transaction.objectStore(storeName)
      const request = objectStore.getAll()

      request.onsuccess = () => {
        let allData = request.result as T[]
        const total = allData.length

        // Apply filtering
        if (filter) {
          allData = allData.filter(filter)
        }

        // Apply sorting
        if (sort?.active) {
          allData.sort((a, b) => {
            const aVal = (a as any)[sort.active]
            const bVal = (b as any)[sort.active]

            if (aVal === bVal) return 0

            let comparison = 0
            if (aVal < bVal) comparison = -1
            else if (aVal > bVal) comparison = 1

            return sort.direction === 'desc' ? -comparison : comparison
          })
        }

        // Apply pagination
        const startIndex = paginator.page * paginator.size
        const endIndex = startIndex + paginator.size
        const paginatedData = allData.slice(startIndex, endIndex)

        resolve({
          data: paginatedData,
          total,
        })
      }

      request.onerror = () => {
        reject('Failed to retrieve list from IndexedDB.')
      }
    })
  }

  dispose(db: IDBDatabase): void {
    db.close()
  }
}
