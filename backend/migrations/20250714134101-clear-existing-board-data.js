'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Primero, eliminar todas las tareas existentes, ya que dependen de las columnas.
    await queryInterface.bulkDelete('Tasks', null, {});
    // Luego, eliminar todas las columnas existentes.
    await queryInterface.bulkDelete('Columns', null, {});
  },

  async down(queryInterface, Sequelize) {
    // Esta operación de limpieza no necesita ser revertida.
    // Dejar vacío o añadir un comentario.
  }
};
