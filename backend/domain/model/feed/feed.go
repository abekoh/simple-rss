package feed

import "time"

type Feed struct {
	FeedID       string
	URL          string
	Title        string
	Description  *string
	RegisteredAt time.Time
}
