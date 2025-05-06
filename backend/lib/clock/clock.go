package clock

import (
	"context"
	"time"
)

func Now(_ context.Context) time.Time {
	return time.Now()
}
