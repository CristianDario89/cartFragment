const cards = document.getElementById('cards');
const items = document.getElementById('items');
const footer = document.getElementById('footer');

const templateCard = document.getElementById('template-card').content
const templateFooter = document.getElementById('template-footer').content
const templateCarrito = document.getElementById('template-carrito').content

const fragment = document.createDocumentFragment()
let carrito = {}


// Eventos
// El evento DOMContentLoaded es disparado cuando el documento HTML ha sido completamente cargado y parseado
document.addEventListener('DOMContentLoaded', e => {
    fetchData()
    //la pregunbta del locals
    if (localStorage.getItem('carrito')) { //si xiste el carrito decimos q
        carrito = JSON.parse(localStorage.getItem('carrito')) 
        pintarCarrito()
         
    }
});

cards.addEventListener('click', e => { addCarrito(e)})
items.addEventListener('click', e => { btnAumentarDisminuir(e) })

// Traer productos
const fetchData = async () => {
  try {
    const res = await fetch('db.json');
    const data = await res.json()
    console.log(data)
    pintarCards(data)

  } catch (error) {
    console.log(error);
  }
   
}  

// Pintar productos
const pintarCards = data => {
 console.log(data)
    data.forEach(producto => {
        templateCard.querySelector('h5').textContent = producto.title
        templateCard.querySelector('p').textContent =  producto.precio
        templateCard.querySelector('img').setAttribute('src', producto.thumbnailUrl)  
        templateCard.querySelector('button').dataset.id = producto.id
        const clone = templateCard.cloneNode(true)
        fragment.appendChild(clone)
    })
    cards.appendChild(fragment)
}


// Agregar al carrito
const addCarrito = e => {
    if (e.target.classList.contains('btn-dark')) {//le mandamos el elemento padre a setCarrito
        // console.log(e.target.dataset.id)
        //console.log(e.target.parentElement)
        setCarrito(e.target.parentElement)
    }
    e.stopPropagation()
}

//Generar OBJETO, SIN NECESIDAD DE RECORRELO, DE HACER PETICIONES A LA BD solo js
const setCarrito = item => {
    // console.log(item)
    //coleccion de nobjetos
    const producto = {
        title: item.querySelector('h5').textContent,
        precio: item.querySelector('p').textContent,
        id: item.querySelector('button').dataset.id,
        cantidad: 1
    }
    //console.log(producto)
    if (carrito.hasOwnProperty(producto.id)) {
        producto.cantidad = carrito[producto.id].cantidad + 1 //carrito[producto.id] = a la coleccion de elem sahora solo accedemos al id
    }

    //carrito en su propiedad carritoid =indexado = una copia de producto ... , 
    //accedemos al obj y lo copiamos. Si nmo existe lo crea y sino lo sobreescribe
    carrito[producto.id] = { ...producto } //una vez empujado este elem al carrito hay q pintarlo
    
    pintarCarrito()
}  

const pintarCarrito = () => {
    items.innerHTML = ''

    Object.values(carrito).forEach(producto => {
        templateCarrito.querySelector('th').textContent = producto.id
        templateCarrito.querySelectorAll('td')[0].textContent = producto.title
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad
        templateCarrito.querySelector('span').textContent = producto.precio * producto.cantidad
        
        //botones
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id

        const clone = templateCarrito.cloneNode(true)
        fragment.appendChild(clone)
    })
    items.appendChild(fragment)
 
    pintarFooter()
 //nuestra COLECCIO DE OBJ pasa a STRING PLANO
    localStorage.setItem('carrito', JSON.stringify(carrito)) 
}


const pintarFooter = () => {
    footer.innerHTML = ''
    
    if (Object.keys(carrito).length === 0) {//si estavacio q pinte esto
      //como es una sola simple liena usamos inner
        footer.innerHTML = `
        <th scope="row" colspan="5">Carrito vacío</th>
        `
        return //hacemos q se salga de toda esta funciom 
    }
    
    // sumar cantidad y sumar totales
    //reduce = 1)toma lgo 2)retorna 3)accedemos a la cant 4)0 xq retorna num
    const nCantidad = Object.values(carrito).reduce((acc, { cantidad }) => acc + cantidad, 0)
    const nPrecio = Object.values(carrito).reduce((acc, {cantidad, precio}) => acc + cantidad * precio ,0)
    // console.log(nPrecio)

    templateFooter.querySelectorAll('td')[0].textContent = nCantidad
    templateFooter.querySelector('span').textContent = nPrecio

    const clone = templateFooter.cloneNode(true)
    fragment.appendChild(clone)

    footer.appendChild(fragment)
 
    const boton = document.querySelector('#vaciar-carrito')
    boton.addEventListener('click', () => {
        carrito = {}
        pintarCarrito()
    })
 
}
  

const btnAumentarDisminuir = e => {
    // console.log(e.target.classList.contains('btn-info'))

    //en la colleccion d e elem del carro accedemos solo a
    if (e.target.classList.contains('btn-info')) {
      //a difertencia del array con find() q recorre TODO EL ARRAY
        const producto = carrito[e.target.dataset.id]
        producto.cantidad++
        carrito[e.target.dataset.id] = { ...producto }
        pintarCarrito()
    }

    if (e.target.classList.contains('btn-danger')) {
        const producto = carrito[e.target.dataset.id]
        producto.cantidad--
        if (producto.cantidad === 0) {
          //eloiminara solo obj d ese indice
            delete carrito[e.target.dataset.id] //delete = de los objetos belongs
        } else {
            carrito[e.target.dataset.id] = {...producto}
        }
        pintarCarrito()
    }
    e.stopPropagation()
}  
 