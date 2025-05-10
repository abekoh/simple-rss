package keymutex

import "sync"

type KeyMutex struct {
	locks   map[string]*sync.Mutex
	mapLock sync.Mutex
}

func New() *KeyMutex {
	return &KeyMutex{locks: make(map[string]*sync.Mutex)}
}

func (l *KeyMutex) Get(key string) *sync.Mutex {
	l.mapLock.Lock()
	defer l.mapLock.Unlock()

	ret, found := l.locks[key]
	if found {
		return ret
	}

	ret = &sync.Mutex{}
	l.locks[key] = ret
	return ret
}
