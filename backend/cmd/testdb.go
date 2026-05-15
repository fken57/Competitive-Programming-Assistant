package main

import(
	"fmt"
	"log"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/jmoiron/sqlx"
)

type User struct{
	ID int `db:"id"`
	Name string `db:"name"`
	Email string `db:"email"`
}

func main(){

	dsn := "postgresql://user:password@localhost:5432/myapp?sslmode=disable"
	db, err := sqlx.Connect("pgx", dsn)
	if(err != nil){
		log.Fatal("接続失敗:", err)
	}
	defer db.Close()

	fmt.Println("データベースに接続しました")

	schema := `CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		name TEXT NOT NULL,
		email TEXT NOT NULL
	);`
	db.MustExec(schema)

	tx := db.MustBegin();
	tx.MustExec("INSERT INTO users (name, email) VALUES ($1, $2)", "John Doe", "john.doe@example.com")
	tx.Commit()

	var user User
	db.Get(&user, "SELECT * FROM users WHERE id = $1", 1)
	fmt.Printf("User: %+v\n", user)
}