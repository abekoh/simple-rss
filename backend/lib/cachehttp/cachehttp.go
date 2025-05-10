package cachehttp

import (
	"bytes"
	"io"
	"net/http"
	"sync"
	"time"
)

type cachedResponse struct {
	resp      *http.Response
	body      []byte
	timestamp time.Time
}

type cacheTransport struct {
	transport http.RoundTripper
	cache     map[string]*cachedResponse
	mutex     sync.RWMutex
	duration  time.Duration
}

func (t *cacheTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	if req.Method != http.MethodGet {
		return t.transport.RoundTrip(req)
	}

	key := req.URL.String()

	t.mutex.RLock()
	if cached, ok := t.cache[key]; ok {
		if time.Since(cached.timestamp) < t.duration {
			t.mutex.RUnlock()
			return cloneResponse(cached)
		}
	}
	t.mutex.RUnlock()

	resp, err := t.transport.RoundTrip(req)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode == http.StatusOK {
		cached, err := cacheResponse(resp)
		if err != nil {
			return resp, nil
		}

		t.mutex.Lock()
		t.cache[key] = cached
		t.mutex.Unlock()
	}

	return resp, nil
}

func cacheResponse(resp *http.Response) (*cachedResponse, error) {
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	resp.Body.Close()

	resp.Body = io.NopCloser(bytes.NewReader(body))

	return &cachedResponse{
		resp:      resp,
		body:      body,
		timestamp: time.Now(),
	}, nil
}

func cloneResponse(cached *cachedResponse) (*http.Response, error) {
	clone := *cached.resp
	clone.Body = io.NopCloser(bytes.NewReader(cached.body))

	return &clone, nil
}

func NewClient() *http.Client {
	return &http.Client{
		Transport: &cacheTransport{
			transport: http.DefaultTransport,
			cache:     make(map[string]*cachedResponse),
			mutex:     sync.RWMutex{},
			duration:  10 * time.Minute,
		},
		Timeout: 10 * time.Second,
	}
}
