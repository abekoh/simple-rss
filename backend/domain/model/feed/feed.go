package feed

import "time"

type ID string

type Feed struct {
	FeedID       string
	URL          string
	Title        string
	Description  *string
	RegisteredAt time.Time
}
