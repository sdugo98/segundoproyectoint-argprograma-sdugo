const express = require("express");
const { connectToDB, disconnectFromMongoDB } = require("./src/mongodb");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Middleware para establecer el encabezado Content-Type en las respuestas
app.use((req, res, next) => {
  res.header("Content-Type", "application/json; charset=utf-8");
  next();
});

// Ruta de inicio
app.get("/", (req, res) => {
  res.status(200).end("Bienvenido a la API de Computacion");
});

// Ruta para obtener los articulos de la coleccion de Computación.
app.get("/computacion", async (req, res) => {
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de articulos de computacion y convertir los documentos a un array
    const db = client.db("computacion");
    const articulos = await db.collection("computacion").find().toArray();
    res.json(articulos);
  } catch (error) {
    // Manejo de errores al obtener los articulos.
    res.status(500).send("Error al obtener los articulos de computacion de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para obtener un articulo por su ID.
app.get("/computacion/:id", async (req, res) => {
  const articuloId = parseInt(req.params.id);
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de articulos de computacion y buscar el articulo por su ID
    const db = client.db("computacion");
    const articulo = await db.collection("computacion").findOne({ codigo: articuloId });
    if (articulo) {
      res.json(articulo);
    } else {
      res.status(404).send("Articulo no encontrado");
    }
  } catch (error) {
    // Manejo de errores al obtener el articulo.
    res.status(500).send("Error al obtener el articulo de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});


// Ruta para obtener un articulo de computacion por su nombre.
app.get("/computacion/nombre/:nombre", async (req, res) => {
  const articuloQuery = req.params.nombre;
  let articuloNombre = RegExp(articuloQuery, "i");
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }
    // Obtener la colección de articulos de computacion y buscar el articulo o los articulos por su Nombre.
    const db = client.db("computacion");
    const articulo = await db
      .collection("computacion")
      .find({ nombre: articuloNombre })
      .toArray();
    if (articulo.length > 0) {
      res.json(articulo);
    } else {
      res.status(404).send("Articulo no encontrado.");
    }
  } catch (error) {
    // Manejo de errores al obtener el articulo.
    res.status(500).send("Error al obtener el articulo de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para obtener un articulo de computacion por su nombre.
app.get("/computacion/categoria/:nombre", async (req, res) => {
    const categoriaQuery = req.params.categoria;
    let categoriaNombre = RegExp(categoriaQuery, "i");
    try {
      // Conexión a la base de datos
      const client = await connectToDB();
      if (!client) {
        res.status(500).send("Error al conectarse a MongoDB");
        return;
      }
      // Obtener la colección de articulos de computacion y buscar el articulo o los articulos por su Nombre.
      const db = client.db("computacion");
      const categoria = await db
        .collection("computacion")
        .find({ categoria: categoriaNombre })
        .toArray();
      if (categoria) {
        res.json(categoria);
      } else {
        res.status(404).send("Categoria no encontrada.");
      }
    } catch (error) {
      // Manejo de errores al obtener la categoria.
      res.status(500).send("Error al obtener la categoria de la base de datos");
    } finally {
      // Desconexión de la base de datos
      await disconnectFromMongoDB();
    }
  });

// Ruta para crear un nuevo articulo
app.post("/computacion", async (req, res) => {
  const nuevoArticulo = req.body;
  try {
    if (nuevoArticulo === undefined) {
      res.status(400).send("Error en el formato de datos a crear.");
    }

    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
    }

    const db = client.db("computacion");
    const collection = db.collection("computacion");
    await collection.insertOne(nuevoArticulo);
    console.log("Nueva articulo de computacion creado.");
    res.status(201).send(nuevoArticulo);
  } catch (error) {
    res.status(500).send("Error al intentar agregar un nuevo articulo.");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});


//Ruta para modificar un recurso
app.patch("/computacion/:id", async (req, res) => {
  const idArticulo = parseInt(req.params.id);
  const nuevosDatos = req.body;
  try {
    if (!nuevosDatos) {
      res.status(400).send("Error en el formato de datos a crear.");
    }

    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
    }

    const db = client.db("computacion");
    const collection = db.collection("computacion");

    await collection.updateOne({ codigo: idArticulo }, { $set: {"precio": nuevosDatos }});

    console.log("Articulo modificado");

    res.status(200).send(nuevosDatos);
  } catch (error) {
    // Manejo de errores al modificar el articulo.
    res.status(500).send("Error al modificar el articulo.");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});


// Ruta para eliminar un recurso
app.delete("/computacion/:id", async (req, res) => {
  const idArticulo = parseInt(req.params.id);
  try {
    if (!idArticulo) {
      res.status(400).send("Error en el formato de datos a crear.");
      return;
    }

    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de articulos, buscar el articulo por su ID y eliminarla
    const db = client.db("computacion");
    const collection = db.collection("computacion");
    const resultado = await collection.deleteOne({ codigo: idArticulo });
    if (resultado.deletedCount === 0) {
      res
        .status(404)
        .send("No se encontró ningun articulo con el id seleccionado.");
    } else {
      console.log("Articulo Eliminado");
      res.status(204).send();
    }
  } catch (error) {
    // Manejo de errores al obtener los articulos.
    res.status(500).send("Error al eliminar la fruta");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});