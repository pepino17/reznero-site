# AMZ Top Products - Blog System

Este es un sistema de blog automático que procesa archivos HTML en la carpeta `Blogs` y los publica en GitHub Pages.

## Cómo usar

1. **Añadir un nuevo post**
   - Crea un archivo HTML en la carpeta `Blogs`
   - El nombre del archivo será usado para la URL (ej: `mi-nuevo-post.html`)
   - Asegúrate de que el HTML incluya metadatos como título, descripción, etc.

2. **Procesar los posts localmente**
   ```bash
   npm install
   npm run build
   ```

3. **Ver los cambios localmente**
   ```bash
   npm run preview
   ```
   Abre http://localhost:8080 en tu navegador

4. **Publicar los cambios**
   ```bash
   git add .
   git commit -m "Añadir nuevo post"
   git push origin main
   ```
   GitHub Actions se encargará del resto automáticamente.

## Estructura de archivos

- `Blogs/` - Aquí van los archivos HTML de los posts
- `blog/` - Carpeta generada automáticamente con los posts procesados
- `assets/` - Archivos estáticos (CSS, JS, imágenes)
- `process-blogs.js` - Script que procesa los posts

## Personalización

Puedes personalizar el diseño editando los estilos en `assets/css/styles.css`.

## Soporte

Si tienes problemas, por favor:
1. Verifica que los archivos HTML tengan la estructura correcta
2. Revisa los logs de GitHub Actions si el despliegue falla
3. Asegúrate de que todos los archivos necesarios estén en el repositorio
