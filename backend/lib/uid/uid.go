package uid

import (
	"context"

	googleuuid "github.com/google/uuid"
)

func NewUUID(_ context.Context) string {
	id, err := googleuuid.NewV7()
	if err != nil {
		panic(err)
	}
	return id.String()
}
