import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home, Lightbulb, Tv, Phone, Droplets, Zap, Wrench,
    Wind, Trash2, Sofa, Bath, Bed, RotateCcw,
    X, Wallet, ArrowRight, Coins, Siren, Sun, Moon,
    Armchair, Utensils, ShowerHead, Monitor, Grid, Mic, Volume2,
    Book, Coffee, Laptop, Camera, Music, Play
} from 'lucide-react';
import { edgeTTS } from '@/services/edgeTTS';
import { useNovaSound } from '@/hooks/useNovaSound';
import { useGamification } from '@/hooks/useGamification';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AvatarDisplay } from '@/components/Gamification/AvatarDisplay';

// --- IMAGE HELPER ---
const getEmojiImg = (name: string) => {
    // Exact folder naming from Microsoft Fluent UI Emoji repo
    const file = name.toLowerCase().replace(/ /g, '_');
    return `https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/${encodeURIComponent(name)}/3D/${file}_3d.png`;
};

// --- DATA ---
interface HouseholdItem {
    id: string;
    folder: string; // The exact Fluent Emoji folder name
    name: string;   // English
    es: string;     // Spanish
    enS: string;    // Sentence English
    esS: string;    // Sentence Spanish
    x: string;      // Visual X %
    y: string;      // Visual Y %
    s?: number;     // Scale factor
    flip?: boolean; // Flip horizontally
    hidden?: boolean; // If true, it won't render an icon (used for structural clicks)
}

interface RoomSection {
    id: string;
    title: string;
    subtitle: string;
    bg: string;
    items: HouseholdItem[];
}

const SECTIONS: RoomSection[] = [
    {
        id: 'living',
        title: 'Level 1: Living Room',
        subtitle: 'The heart of our home.',
        bg: 'from-[#FFF9F0] to-[#FFE3C2]',
        items: [
            // ═══ WALL ZONE ═══
            { id: '6', folder: 'Framed picture', name: 'Picture', es: 'Cuadro', enS: 'A beautiful painting.', esS: 'Una pintura hermosa.', x: '12%', y: '10%', s: 0.8 },

            // ═══ FIREPLACE AREA (left wall) ═══
            // TV sitting on the Mantel (mesa)
            { id: '1', folder: 'Television', name: 'Television', es: 'Televisor', enS: 'I watch movies here.', esS: 'Veo películas aquí.', x: '26%', y: '13%', s: 1.5 },
            // Fireplace Structure & Fire
            { id: 'fireplace_struct', folder: 'Fireplace', name: 'Fireplace', es: 'Chimenea', enS: 'The fireplace is made of stone.', esS: 'La chimenea es de piedra.', x: '26%', y: '34%', s: 1.0, hidden: true },
            { id: '24', folder: 'Wood', name: 'Log', es: 'Leña', enS: 'The log is for the fire.', esS: 'El tronco es para el fuego.', x: '18%', y: '32%', s: 0.7 },
            { id: '20', folder: 'Fire', name: 'Fire', es: 'Fuego', enS: 'The fire is warm.', esS: 'El fuego es cálido.', x: '26%', y: '36%', s: 0.7 },

            // ═══ STUDY DESK (lower-left) ═══
            { id: '14', folder: 'Telephone', name: 'Phone', es: 'Teléfono', enS: 'Call your friends.', esS: 'Llama a tus amigos.', x: '5%', y: '50%', s: 0.35 },
            { id: '11', folder: 'Laptop', name: 'Laptop', es: 'Laptop', enS: 'I play games here.', esS: 'Juego juegos aquí.', x: '16%', y: '49%', s: 0.45 },
            { id: '16', folder: 'Glasses', name: 'Glasses', es: 'Lentes', enS: 'I can see better.', esS: 'Puedo ver mejor.', x: '28%', y: '51%', s: 0.3 },
            { id: '7', folder: 'Alarm clock', name: 'Clock', es: 'Reloj', enS: 'What time is it?', esS: '¿Qué hora es?', x: '35%', y: '48%', s: 0.4 },

            // ═══ BOOKSHELF (right side) ═══
            { id: '3', folder: 'Books', name: 'Books', es: 'Libros', enS: 'Read a magic story.', esS: 'Lee una historia mágica.', x: '74%', y: '30%', s: 0.6 },
            { id: '10', folder: 'Candle', name: 'Candle', es: 'Vela', enS: 'The candle is warm.', esS: 'La vela está caliente.', x: '90%', y: '30%', s: 0.4 },
            { id: '4', folder: 'Oil lamp', name: 'Lamp', es: 'Lámpara', enS: 'The lamp gives light.', esS: 'La lámpara da luz.', x: '74%', y: '45%', s: 0.6 }, // Proper lamp
            { id: '18', folder: 'Camera', name: 'Camera', es: 'Cámara', enS: 'Take a photo.', esS: 'Toma una foto.', x: '90%', y: '46%', s: 0.4 },

            // ═══ LIVING AREA (Center) ═══
            { id: '5', folder: 'Potted plant', name: 'Plant', es: 'Planta', enS: 'Water the green plant.', esS: 'Riega la planta verde.', x: '14%', y: '70%', s: 0.9 },
            { id: '2', folder: 'Couch and lamp', name: 'Sofa', es: 'Sofá', enS: 'Sit down and relax.', esS: 'Siéntate y relájate.', x: '60%', y: '68%', s: 2.2 },
            { id: '8', folder: 'Radio', name: 'Radio', es: 'Radio', enS: 'Listen to the music.', esS: 'Escucha la música.', x: '45%', y: '82%', s: 0.45 },
            // Chairs facing each other (Left flipped to face Right, Right flipped to face Left if needed, usually default is left-facing)
            // Assuming Chair default faces LEFT.
            { id: '21', folder: 'Chair', name: 'Chair', es: 'Silla', enS: 'Sit on the chair.', esS: 'Siéntate en la silla.', x: '28%', y: '80%', s: 1.1, flip: true }, // Flip to face Right
            { id: '22', folder: 'Chair', name: 'Chair', es: 'Silla', enS: 'Siéntate en la silla.', esS: 'Sit on the chair.', x: '72%', y: '80%', s: 1.1 }, // Faces Left (default)

            // ═══ FLOOR / ENTRANCE ═══
            { id: '23', folder: 'Dog', name: 'Dog', es: 'Perro', enS: 'The dog is walking.', esS: 'El perro está caminando.', x: '60%', y: '90%', s: 1.0 },
            { id: '19', folder: 'Wrapped gift', name: 'Gift', es: 'Regalo', enS: 'Happy birthday to you.', esS: 'Feliz cumpleaños a ti.', x: '8%', y: '88%', s: 0.5 },
            { id: '15', folder: 'Backpack', name: 'Backpack', es: 'Mochila', enS: 'Ready for school.', esS: 'Listo para la escuela.', x: '88%', y: '90%', s: 0.6 },
            { id: '12', folder: 'Briefcase', name: 'Briefcase', es: 'Maletín', enS: 'Dad goes to work.', esS: 'Papá va al trabajo.', x: '96%', y: '90%', s: 0.6 },
        ]

    },
    {
        id: 'kitchen',
        title: 'Level 2: Kitchen',
        subtitle: 'Where magic food happens.',
        bg: 'from-[#F0F7FF] to-[#DCEBFF]',
        items: [
            // ═══ FLOOR / LARGE APPLIANCES ═══
            { id: '21', folder: 'Refrigerator', name: 'Fridge', es: 'Nevera', enS: 'The milk is cold.', esS: 'La leche está fría.', x: '18%', y: '58%', s: 1.9 },
            { id: '119', folder: 'Gas stove', name: 'Stove', es: 'Estufa', enS: 'Cook dinner.', esS: 'Cocina la cena.', x: '40%', y: '60%', s: 1.6 }, // Replaced Cooking with Stove? No, must use existing ID layout if possible. Wait, ID 119 was Tractor in Garage? 
            // Checking original IDs. ID 22 is 'Cooking' (Pan). I will put Pan on the stove.
            { id: '22', folder: 'Cooking', name: 'Pan', es: 'Sartén', enS: 'Cook an egg.', esS: 'Cocina un huevo.', x: '40%', y: '54%', s: 0.6 },

            // ═══ COUNTERTOP (Left & Back) ═══
            { id: '24', folder: 'Microwave', name: 'Microwave', es: 'Microondas', enS: 'Heat the pizza.', esS: 'Calienta la pizza.', x: '88%', y: '45%', s: 0.85 },
            { id: '23', folder: 'Toaster', name: 'Toaster', es: 'Tostadora', enS: 'Bread is crunchy.', esS: 'El pan está crujiente.', x: '75%', y: '46%', s: 0.65 },
            { id: '27', folder: 'Teapot', name: 'Teapot', es: 'Tetera', enS: 'Tea is ready.', esS: 'El té está listo.', x: '65%', y: '46%', s: 0.6 },
            { id: '38', folder: 'Kitchen knife', name: 'Knife', es: 'Cuchillo', enS: 'Be very careful.', esS: 'Ten mucho cuidado.', x: '50%', y: '46%', s: 0.4 },

            // ═══ DINING TABLE (Right Foreground) ═══
            { id: '36', folder: 'Pizza', name: 'Pizza', es: 'Pizza', enS: 'Cheese and tomato.', esS: 'Queso y tomate.', x: '60%', y: '78%', s: 0.7 },
            { id: '37', folder: 'Hamburger', name: 'Burger', es: 'Hamburguesa', enS: 'Tasty burger.', esS: 'Hamburguesa sabrosa.', x: '75%', y: '78%', s: 0.6 },
            { id: '26', folder: 'Bowl with spoon', name: 'Bowl', es: 'Tazón', enS: 'I like cereal.', esS: 'Me gusta el cereal.', x: '50%', y: '82%', s: 0.6 },
            { id: '35', folder: 'Glass of milk', name: 'Milk', es: 'Leche', enS: 'Drink your milk.', esS: 'Bebe tu leche.', x: '85%', y: '75%', s: 0.5 },

            // ═══ SHELVES / FOOD STORAGE ═══
            { id: '31', folder: 'Bread', name: 'Bread', es: 'Pan', enS: 'Freshly baked bread.', esS: 'Pan recién horneado.', x: '10%', y: '25%', s: 0.6 },
            { id: '33', folder: 'Egg', name: 'Egg', es: 'Huevo', enS: 'The egg is oval.', esS: 'El huevo es ovalado.', x: '25%', y: '26%', s: 0.4 },
            { id: '34', folder: 'Bottle with popping cork', name: 'Juice', es: 'Jugo', enS: 'Orange juice is good.', esS: 'El jugo de naranja es bueno.', x: '40%', y: '25%', s: 0.55 },
            { id: '28', folder: 'Coffee', name: 'Coffee', es: 'Café', enS: 'Wake up with coffee.', esS: 'Despierta con café.', x: '52%', y: '26%', s: 0.5 },
            { id: '30', folder: 'Salt', name: 'Salt', es: 'Sal', enS: 'Add some salt.', esS: 'Añade algo de sal.', x: '60%', y: '15%', s: 0.4 },

            // ═══ FLOATING / OTHERS ═══
            { id: '32', folder: 'Apple', name: 'Apple', es: 'Manzana', enS: 'Eat an apple.', esS: 'Come una manzana.', x: '28%', y: '85%', s: 0.45 },
            { id: '39', folder: 'Spoon', name: 'Spoon', es: 'Cuchara', enS: 'Use your spoon.', esS: 'Usa tu cuchara.', x: '65%', y: '80%', s: 0.4 },
            { id: '29', folder: 'Honey pot', name: 'Honey', es: 'Miel', enS: 'Sweet like honey.', esS: 'Dulce como la miel.', x: '70%', y: '15%', s: 0.5 },
            { id: '40', folder: 'Glass with straw', name: 'Soft drink', es: 'Soda', enS: 'Cold drink.', esS: 'Bebida fría.', x: '85%', y: '85%', s: 0.5 },
            // Missing: Fork and Knife (25)
            { id: '25', folder: 'Fork and knife', name: 'Cutlery', es: 'Cubiertos', enS: 'Eat your dinner.', esS: 'Come tu cena.', x: '55%', y: '80%', s: 0.5 },
        ]
    },
    {
        id: 'bedroom',
        title: 'Level 3: Bedroom',
        subtitle: 'Sweet dreams and magic toys.',
        bg: 'from-[#FFF0F5] to-[#FFD6E8]',
        items: [
            // ═══ CENTRAL BED ═══
            { id: '41', folder: 'Bed', name: 'Bed', es: 'Cama', enS: 'I sleep in my bed.', esS: 'Duermo en mi cama.', x: '50%', y: '60%', s: 2.4 },
            { id: '46', folder: 'Teddy bear', name: 'Teddy bear', es: 'Oso de peluche', enS: 'My bear is soft.', esS: 'Mi oso es suave.', x: '50%', y: '60%', s: 0.7 },
            { id: '51', folder: 'Mirror', name: 'Mirror', es: 'Espejo', enS: 'Look at your face.', esS: 'Mira tu cara.', x: '88%', y: '40%', s: 0.8 },

            // ═══ WALL & WINDOW ═══
            { id: '52', folder: 'Window', name: 'Window', es: 'Ventana', enS: 'Look at the sky.', esS: 'Mira el cielo.', x: '50%', y: '20%', s: 1.2 },
            { id: '53', folder: 'Door', name: 'Door', es: 'Puerta', enS: 'Open the door.', esS: 'Abre la puerta.', x: '8%', y: '45%', s: 1.8 },

            // ═══ DESK AREA (Left) ═══
            { id: '42', folder: 'Laptop', name: 'Laptop', es: 'Computadora', enS: 'I do my homework.', esS: 'Hago mi tarea.', x: '20%', y: '54%', s: 0.7 },
            { id: '57', folder: 'Mobile phone', name: 'Phone', es: 'Teléfono', enS: 'Call your grandma.', esS: 'Llama a tu abuela.', x: '12%', y: '56%', s: 0.4 },
            { id: '55', folder: 'Books', name: 'Books', es: 'Libros', enS: 'Reading time.', esS: 'Hora de leer.', x: '25%', y: '50%', s: 0.65 },
            { id: '54', folder: 'Candle', name: 'Candle', es: 'Vela', enS: 'The light is soft.', esS: 'La luz es suave.', x: '10%', y: '48%', s: 0.45 },
            { id: '43', folder: 'Alarm clock', name: 'Alarm clock', es: 'Reloj', enS: 'Wake up, it is morning!', esS: '¡Despierta, es de día!', x: '28%', y: '56%', s: 0.5 },

            // ═══ WARDROBE AREA (Clothing) ═══
            { id: '47', folder: 'T-shirt', name: 'Shirt', es: 'Camisa', enS: 'Put on your shirt.', esS: 'Ponte la camisa.', x: '75%', y: '25%', s: 0.6 },
            { id: '48', folder: 'Jeans', name: 'Pants', es: 'Pantalones', enS: 'Blue pants.', esS: 'Pantalones azules.', x: '82%', y: '25%', s: 0.6 },
            { id: '49', folder: 'Socks', name: 'Socks', es: 'Calcetines', enS: 'Warm socks.', esS: 'Calcetines calientes.', x: '90%', y: '25%', s: 0.5 },
            { id: '50', folder: 'Hat', name: 'Hat', es: 'Sombrero', enS: 'A magic hat.', esS: 'Un sombrero mágico.', x: '92%', y: '16%', s: 0.5 },
            { id: '58', folder: 'Headphone', name: 'Headphones', es: 'Audífonos', enS: 'I love music.', esS: 'Amo la música.', x: '68%', y: '20%', s: 0.55 },

            // ═══ FLOOR ITEMS ═══
            { id: '44', folder: 'Chair', name: 'Chair', es: 'Silla', enS: 'Sit down at the desk.', esS: 'Siéntate en el escritorio.', x: '25%', y: '80%', s: 1.0, flip: true },
            { id: '45', folder: 'Backpack', name: 'Backpack', es: 'Mochila', enS: 'I go to school.', esS: 'Voy a la escuela.', x: '12%', y: '85%', s: 0.7 },
            { id: '59', folder: 'Basketball', name: 'Ball', es: 'Pelota', enS: 'Let’s play ball.', esS: 'Vamos a jugar pelota.', x: '85%', y: '85%', s: 0.75 },
            { id: '60', folder: 'Suitcase', name: 'Suitcase', es: 'Maleta', enS: 'Go on a trip.', esS: 'Ve de viaje.', x: '70%', y: '90%', s: 0.8 },
            { id: '56', folder: 'Camera', name: 'Camera', es: 'Cámara', enS: 'Smile for the camera.', esS: 'Sonríe a la cámara.', x: '50%', y: '88%', s: 0.45 },
        ]
    },
    {
        id: 'bathroom',
        title: 'Level 4: Bathroom',
        subtitle: 'Bubbles and clean water.',
        bg: 'from-[#E0F7FA] to-[#B2EBF2]',
        items: [
            // ═══ BATH / SHOWER ═══
            { id: '63', folder: 'Bathtub', name: 'Bathtub', es: 'Bañera', enS: 'Take a bubble bath.', esS: 'Toma un baño de burbujas.', x: '75%', y: '65%', s: 2.5 },
            { id: '61', folder: 'Shower', name: 'Shower', es: 'Ducha', enS: 'Wash your body.', esS: 'Lava tu cuerpo.', x: '80%', y: '45%', s: 1.0 },
            { id: '71', folder: 'Droplet', name: 'Water', es: 'Agua', enS: 'Drink fresh water.', esS: 'Bebe agua fresca.', x: '80%', y: '40%', s: 0.5 },
            { id: '80', folder: 'Duck', name: 'Rubber duck', es: 'Patito', enS: 'The duck floats.', esS: 'El pato flota.', x: '70%', y: '60%', s: 0.5 },

            // ═══ VANITY / SINK ═══
            { id: '68', folder: 'Mirror', name: 'Mirror', es: 'Espejo', enS: 'I see my reflection.', esS: 'Veo mi reflejo.', x: '45%', y: '25%', s: 0.9 },
            { id: '65', folder: 'Toothbrush', name: 'Toothbrush', es: 'Cepillo', enS: 'Brush your teeth.', esS: 'Cepilla tus dientes.', x: '40%', y: '42%', s: 0.4 },
            { id: '64', folder: 'Soap', name: 'Soap', es: 'Jabón', enS: 'Use the soap.', esS: 'Usa el jabón.', x: '50%', y: '43%', s: 0.35 },
            { id: '66', folder: 'Sponge', name: 'Sponge', es: 'Esponja', enS: 'The sponge is soft.', esS: 'La esponja es suave.', x: '55%', y: '43%', s: 0.35 },
            { id: '76', folder: 'Comb', name: 'Comb', es: 'Peine', enS: 'Peina tu cabello.', esS: 'Comb your hair.', x: '35%', y: '43%', s: 0.4 },

            // ═══ TOILET AREA ═══
            { id: '62', folder: 'Toilet', name: 'Toilet', es: 'Inodoro', enS: 'Flush the water.', esS: 'Baja el agua.', x: '18%', y: '68%', s: 1.3 },
            { id: '69', folder: 'Roll of paper', name: 'Paper', es: 'Papel', enS: 'Toilet paper.', esS: 'Papel higiénico.', x: '25%', y: '62%', s: 0.5 },
            { id: '70', folder: 'Plunger', name: 'Plunger', es: 'Destapacaños', enS: 'Fix the toilet.', esS: 'Arregla el baño.', x: '8%', y: '70%', s: 0.7 },

            // ═══ FLOOR / STORAGE ═══
            { id: '75', folder: 'Bathrobe', name: 'Robe', es: 'Bata', enS: 'Wear the robe.', esS: 'Ponte la bata.', x: '10%', y: '40%', s: 0.8 },
            { id: '67', folder: 'Bucket', name: 'Bucket', es: 'Balde', enS: 'Fill it with water.', esS: 'Llénalo con agua.', x: '15%', y: '88%', s: 0.7 },
            { id: '78', folder: 'Wastebasket', name: 'Trash can', es: 'Basura', enS: 'Throw it away.', esS: 'Tíralo a la basura.', x: '90%', y: '88%', s: 0.75 },
            { id: '77', folder: 'Handbag', name: 'Bag', es: 'Bolso', enS: 'My bathroom bag.', esS: 'Mi bolso de baño.', x: '30%', y: '88%', s: 0.7 },

            // ═══ SHELVES / DECOR ═══
            { id: '72', folder: 'Bottle with popping cork', name: 'Lotion', es: 'Loción', enS: 'Skin lotion.', esS: 'Loción para la piel.', x: '90%', y: '25%', s: 0.5 },
            { id: '79', folder: 'Bubbles', name: 'Bubbles', es: 'Burbujas', enS: 'Shiny bubbles.', esS: 'Burbujas brillantes.', x: '70%', y: '15%', s: 0.5 },
            { id: '74', folder: 'Microscope', name: 'Germs', es: 'Gérmenes', enS: 'Wash away germs.', esS: 'Lava los gérmenes.', x: '92%', y: '12%', s: 0.4 },
            { id: '73', folder: 'Safety pin', name: 'Pin', es: 'Pin', enS: 'Be careful with it.', esS: 'Ten cuidado con eso.', x: '85%', y: '12%', s: 0.3 },
        ]
    },
    {
        id: 'garden',
        title: 'Level 5: Magic Garden',
        subtitle: 'Nature and fresh air.',
        bg: 'from-[#EBF7E9] to-[#C8E6C9]',
        items: [
            // ═══ SKY ZONE ═══
            { id: '100', folder: 'Rainbow', name: 'Rainbow', es: 'Arcoíris', enS: 'Many colors!', esS: '¡Muchos colores!', x: '50%', y: '12%', s: 1.5 },
            { id: '83', folder: 'Sun', name: 'Sun', es: 'Sol', enS: 'The sun is hot.', esS: 'El sol está caliente.', x: '12%', y: '12%', s: 1.4 },
            { id: '84', folder: 'Cloud', name: 'Cloud', es: 'Nube', enS: 'The cloud is white.', esS: 'La nube es blanca.', x: '82%', y: '15%', s: 1.2 },
            { id: '90', folder: 'Bird', name: 'Bird', es: 'Pájaro', enS: 'The bird sings.', esS: 'El pájaro canta.', x: '92%', y: '32%', s: 0.6 },
            { id: '91', folder: 'Butterfly', name: 'Butterfly', es: 'Mariposa', enS: 'A beautiful butterfly.', esS: 'Una mariposa hermosa.', x: '75%', y: '22%', s: 0.5 },
            { id: '92', folder: 'Honeybee', name: 'Bee', es: 'Abeja', enS: 'The bee makes honey.', esS: 'La abeja hace miel.', x: '35%', y: '28%', s: 0.4 },

            // ═══ POOL & MIDGROUND ═══
            { id: '81', folder: 'Swimming pool', name: 'Pool', es: 'Piscina', enS: 'Let’s swim!', esS: '¡Vamos a nadar!', x: '50%', y: '65%', s: 2.5 },
            { id: '94', folder: 'Umbrella', name: 'Umbrella', es: 'Sombrilla', enS: 'Stay in the shade.', esS: 'Quédate en la sombra.', x: '72%', y: '82%', s: 1.2 },
            { id: '89', folder: 'Soccer ball', name: 'Ball', es: 'Pelota', enS: 'Kick the ball.', esS: 'Patea la pelota.', x: '42%', y: '82%', s: 0.7 },
            { id: '85', folder: 'Deciduous tree', name: 'Tree', es: 'Árbol', enS: 'The tree is tall.', esS: 'El árbol es alto.', x: '15%', y: '38%', s: 2.0 },
            { id: '98', folder: 'Spider', name: 'Spider', es: 'Araña', enS: 'The spider has 8 legs.', esS: 'La araña tiene 8 patas.', x: '5%', y: '25%', s: 0.45 },

            // ═══ EQUIPMENT ZONE ═══
            { id: '88', folder: 'Bicycle', name: 'Bicycle', es: 'Bicicleta', enS: 'Ride your bike.', esS: 'Monta tu bici.', x: '22%', y: '52%', s: 1.2 },
            { id: '82', folder: 'Grill', name: 'BBQ', es: 'Parrilla', enS: 'Cook hot dogs.', esS: 'Cocina hot dogs.', x: '88%', y: '58%', s: 1.1 },
            { id: '95', folder: 'Bench', name: 'Bench', es: 'Banco', enS: 'Sit on the bench.', esS: 'Siéntate en el banco.', x: '85%', y: '78%', s: 1.2 },

            // ═══ FLOWERS & PLANTS ═══
            { id: '86', folder: 'Flower', name: 'Flower', es: 'Flor', enS: 'This flower smells good.', esS: 'Esta flor huele bien.', x: '28%', y: '88%', s: 0.7 },
            { id: '87', folder: 'Tulip', name: 'Tulip', es: 'Tulipán', enS: 'A red tulip.', esS: 'Un tulipán rojo.', x: '62%', y: '88%', s: 0.65 },
            { id: '99', folder: 'Grass', name: 'Grass', es: 'Pasto', enS: 'The grass is green.', esS: 'El paso es verde.', x: '45%', y: '92%', s: 0.8 },
            { id: '93', folder: 'Watering can', name: 'Watering can', es: 'Regadera', enS: 'Water the garden.', esS: 'Riega el jardín.', x: '8%', y: '82%', s: 0.75 },
            { id: '96', folder: 'Seedling', name: 'Small plant', es: 'Plantita', enS: 'It will grow big.', esS: 'Crecerá mucho.', x: '14%', y: '75%', s: 0.6 },
            { id: '97', folder: 'Lady beetle', name: 'Ladybug', es: 'Mariquita', enS: 'Look at the ladybug.', esS: 'Mira la mariquita.', x: '65%', y: '58%', s: 0.45 },
        ]
    },
    {
        id: 'garage',
        title: 'Level 6: Super Garage',
        subtitle: 'Tools and safe travels.',
        bg: 'from-[#ECEFF1] to-[#CFD8DC]',
        items: [
            // ═══ VEHICLES (Center Pieces) ═══
            { id: '101', folder: 'Automobile', name: 'Car', es: 'Coche', enS: 'Our car is fast.', esS: 'Nuestro coche es rápido.', x: '40%', y: '68%', s: 2.2 },
            { id: '119', folder: 'Tractor', name: 'Tractor', es: 'Tractor', enS: 'Work on the farm.', esS: 'Trabajo en la granja.', x: '75%', y: '68%', s: 1.8 },

            // ═══ LEFT WALL (Service & Cleaning) ═══
            { id: '102', folder: 'Washing machine', name: 'Washer', es: 'Lavadora', enS: 'Wash the clothes.', esS: 'Lava la ropa.', x: '12%', y: '45%', s: 1.4 },
            { id: '110', folder: 'Broom', name: 'Broom', es: 'Escoba', enS: 'Sweep the floor.', esS: 'Barre el suelo.', x: '5%', y: '55%', s: 1.0 },
            { id: '117', folder: 'Fire extinguisher', name: 'Fire extinguisher', es: 'Extinguidor', enS: 'Stay safe.', esS: 'Mantente seguro.', x: '8%', y: '25%', s: 0.8 },
            { id: '114', folder: 'Plug', name: 'Plug', es: 'Enchufe', enS: 'Electricity.', esS: 'Electricidad.', x: '8%', y: '12%', s: 0.6 },

            // ═══ RIGHT WALL (Tool Board) ═══
            { id: '103', folder: 'Hammer', name: 'Hammer', es: 'Martillo', enS: 'Use the hammer.', esS: 'Usa el martillo.', x: '78%', y: '25%', s: 0.6 },
            { id: '104', folder: 'Wrench', name: 'Wrench', es: 'Llave', enS: 'Fix the pipe.', esS: 'Arregla el tubo.', x: '88%', y: '25%', s: 0.6 },
            { id: '105', folder: 'Screwdriver', name: 'Screwdriver', es: 'Destornillador', enS: 'Tighten the screw.', esS: 'Aprieta el tornillo.', x: '83%', y: '15%', s: 0.5 },
            { id: '120', folder: 'Ladder', name: 'Ladder', es: 'Escalera', enS: 'Climb up high.', esS: 'Sube muy alto.', x: '94%', y: '35%', s: 1.5 },

            // ═══ WORKBENCH AREAS ═══
            { id: '106', folder: 'Toolbox', name: 'Toolbox', es: 'Caja de herramientas', enS: 'Put tools inside.', esS: 'Pon las herramientas dentro.', x: '70%', y: '45%', s: 1.0 },
            { id: '113', folder: 'Battery', name: 'Battery', es: 'Batería', enS: 'Power source.', esS: 'Fuente de energía.', x: '82%', y: '45%', s: 0.6 },
            { id: '115', folder: 'Magnet', name: 'Magnet', es: 'Imán', enS: 'It attracts metal.', esS: 'Atrae metal.', x: '88%', y: '88%', s: 0.6 },

            // ═══ STORAGE / SHELVES ═══
            { id: '108', folder: 'Key', name: 'Key', es: 'Llave', enS: 'Open the lock.', esS: 'Abre el candado.', x: '35%', y: '15%', s: 0.4 },
            { id: '109', folder: 'Lock', name: 'Lock', es: 'Cerradura', enS: 'Safety first.', esS: 'Seguridad primero.', x: '65%', y: '15%', s: 0.5 },
            { id: '118', folder: 'Gas station', name: 'Gasoline', es: 'Gasolina', enS: 'Fuel for travel.', esS: 'Gasolina para viajar.', x: '82%', y: '8%', s: 0.7 },

            // ═══ FLOOR ITEMS ═══
            { id: '111', folder: 'Bucket', name: 'Bucket', es: 'Balde', enS: 'Wash the car.', esS: 'Lava el coche.', x: '22%', y: '88%', s: 0.8 },
            { id: '116', folder: 'Oil drum', name: 'Oil', es: 'Aceite', enS: 'Oil for the car.', esS: 'Aceite para el coche.', x: '58%', y: '88%', s: 1.2 },
            { id: '107', folder: 'Flashlight', name: 'Flashlight', es: 'Linterna', enS: 'I see in the dark.', esS: 'Veo en la oscuridad.', x: '8%', y: '88%', s: 0.6 },
            { id: '112', folder: 'Auto rickshaw', name: 'Taxi', es: 'Taxi', enS: 'Go to the city.', esS: 'Ve a la ciudad.', x: '80%', y: '90%', s: 1.1 },
        ]
    }
];

export const MyHouseHub = ({ onClose }: { onClose: () => void }) => {
    const { playClick, playSuccess } = useNovaSound();
    const { novaCoins, buyItem } = useGamification();

    const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
    const [learnedCount, setLearnedCount] = useState<Record<string, Set<string>>>({});
    const [selectedItem, setSelectedItem] = useState<HouseholdItem | null>(null);
    const [isLearningItem, setIsLearningItem] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const activeSection = SECTIONS[currentSectionIdx];
    const wordsInThisRoom = learnedCount[activeSection.id]?.size || 0;
    const canUnlockNext = wordsInThisRoom >= 12;

    const speakItem = async (item: HouseholdItem) => {
        setSelectedItem(item);
        setIsLearningItem(true);
        await edgeTTS.speak(item.name, "rachelle");
        await edgeTTS.speak(item.es, "lina");
        await edgeTTS.speak(item.enS, "rachelle");
        await edgeTTS.speak(item.esS, "lina");
        startVoice(item);
    };

    const startVoice = (target: HouseholdItem) => {
        if (!('webkitSpeechRecognition' in window)) return;
        setIsListening(true);
        const rec = new (window as any).webkitSpeechRecognition();
        rec.lang = 'en-US';
        rec.onresult = (e: any) => {
            const heard = e.results[0][0].transcript.toLowerCase();
            if (heard.includes(target.name.toLowerCase())) {
                playSuccess();
                edgeTTS.speak("Excellent pronunciation!", "rachelle");
                setLearnedCount(prev => {
                    const roomSet = prev[activeSection.id] || new Set();
                    roomSet.add(target.id);
                    return { ...prev, [activeSection.id]: new Set(roomSet) };
                });
                setTimeout(() => {
                    setSelectedItem(null);
                    setIsLearningItem(false);
                }, 2000);
            } else {
                edgeTTS.speak("Nice try! Let's try saying it one more time.", "rachelle");
                setTimeout(() => {
                    if (isLearningItem) startVoice(target);
                }, 2500);
            }
        };
        rec.onerror = () => {
            setIsListening(false);
        };
        rec.onend = () => setIsListening(false);
        rec.start();
    };

    return (
        <div className="fixed inset-0 z-[60] bg-slate-900 flex items-center justify-center p-0 md:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white w-full h-full md:rounded-[40px] overflow-hidden flex flex-col md:flex-row relative">

                {/* HUD SIDEBAR */}
                <div className="w-full md:w-80 bg-slate-50 p-8 border-r flex flex-col gap-8 z-20">
                    <div className="flex justify-between items-center">
                        <Button variant="outline" className="rounded-2xl" onClick={onClose}><ArrowRight className="rotate-180" /></Button>
                        <div className="bg-yellow-400 px-5 py-2.5 rounded-2xl font-black flex items-center gap-2 shadow-md">
                            <Coins size={20} /> {novaCoins}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-6 text-center">
                        <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-200">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Location</h2>
                            <p className="text-xl font-black text-slate-800 uppercase">{activeSection.title}</p>
                        </div>

                        <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-200">
                            <h2 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Words Learned</h2>
                            <div className="flex items-end justify-center gap-2">
                                <span className="text-5xl font-black">{wordsInThisRoom}</span>
                                <span className="text-xl font-bold opacity-60">/ {activeSection.items.length}</span>
                            </div>
                            <div className="mt-4 h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${(wordsInThisRoom / 12) * 100}%` }} className="h-full bg-white shadow-[0_0_10px_white]" />
                            </div>
                            <p className="mt-4 text-[10px] font-bold uppercase opacity-80 leading-tight">
                                {canUnlockNext ? "The next room is unlocked!" : `Learn ${12 - wordsInThisRoom} more to open the door.`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* GAME STAGE */}
                <div className={cn("flex-1 relative overflow-hidden transition-colors duration-1000 bg-gradient-to-br", activeSection.bg)}>

                    {/* Room Layout Controls */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-white shadow-2xl flex gap-2">
                        {SECTIONS.map((s, idx) => (
                            <button
                                key={s.id}
                                onClick={() => { setCurrentSectionIdx(idx); playClick(); }}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap",
                                    currentSectionIdx === idx
                                        ? "bg-indigo-600 text-white shadow-lg"
                                        : (idx === 0 || learnedCount[SECTIONS[idx - 1]?.id]?.size >= 12)
                                            ? "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                            : "opacity-30 cursor-not-allowed"
                                )}
                                disabled={!(idx === 0 || (SECTIONS[idx - 1] && learnedCount[SECTIONS[idx - 1].id]?.size >= 12))}
                            >
                                {s.title.split(': ')[1]}
                            </button>
                        ))}
                    </div>

                    <div className="absolute inset-0 p-4 md:p-12 md:pt-24 [perspective:2000px]">
                        <motion.div
                            key={activeSection.id}
                            initial={{ y: 50, opacity: 0, rotateX: 10 }}
                            animate={{ y: 0, opacity: 1, rotateX: 0 }}
                            className="relative w-full h-full rounded-[4rem] border-[12px] border-white shadow-2xl overflow-hidden"
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            {/* ═══ ROOM BACKGROUND ═══ */}
                            {activeSection.id === 'living' && (
                                <>
                                    {/* Warm wall */}
                                    <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #FFF5E6 0%, #FFE8CC 35%, #FFDDB3 60%, #C4956A 66%, #B8864E 75%, #A67B45 85%, #8B6533 100%)' }} />
                                    {/* Wall molding top */}
                                    <div className="absolute inset-x-0 top-0 h-[3%]" style={{ background: 'linear-gradient(180deg, #E8C9A0, #D4A574)' }} />
                                    {/* Wainscoting */}
                                    <div className="absolute inset-x-0" style={{ top: '58%', height: '5%', background: 'linear-gradient(180deg, #E8D5BE, #D4B896)', borderTop: '2px solid #C4956A', borderBottom: '2px solid #C4956A' }} />

                                    {/* ── WINDOW (right side of wall) ── */}
                                    <div className="absolute rounded-md" style={{ left: '68%', top: '3%', width: '18%', height: '18%', background: 'linear-gradient(180deg, #87CEEB 0%, #B0E0F6 60%, #E0F2FE 100%)', border: '4px solid #A0764E', boxShadow: 'inset 0 0 15px rgba(255,255,255,0.5)' }} />
                                    <div className="absolute" style={{ left: '77%', top: '3%', width: '2px', height: '18%', background: '#A0764E' }} />
                                    <div className="absolute" style={{ left: '68%', top: '12%', width: '18%', height: '2px', background: '#A0764E' }} />
                                    {/* Curtains */}
                                    <div className="absolute" style={{ left: '64%', top: '2%', width: '5%', height: '22%', background: 'linear-gradient(90deg, rgba(139,0,0,0.25), rgba(139,0,0,0.1))', borderRadius: '0 0 30% 0' }} />
                                    <div className="absolute" style={{ left: '85%', top: '2%', width: '5%', height: '22%', background: 'linear-gradient(90deg, rgba(139,0,0,0.1), rgba(139,0,0,0.25))', borderRadius: '0 0 0 30%' }} />

                                    {/* ── FIREPLACE (left-center wall) ── */}
                                    <div
                                        onClick={() => {
                                            const item = activeSection.items.find(i => i.id === 'fireplace_struct');
                                            if (item) speakItem(item);
                                        }}
                                        className="absolute rounded-t-lg cursor-pointer hover:brightness-110 transition-all z-10"
                                        style={{ left: '12%', top: '22%', width: '28%', height: '24%', background: 'linear-gradient(180deg, #A09080 0%, #8B8070 50%, #706050 100%)', border: '3px solid #5A5040', boxShadow: '0 6px 20px rgba(0,0,0,0.25)' }}
                                    />
                                    <div className="absolute" style={{ left: '10%', top: '20%', width: '32%', height: '4%', background: 'linear-gradient(180deg, #8B6914 0%, #6B4226 100%)', borderRadius: '4px', border: '2px solid #3D2213', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }} />
                                    <div className="absolute rounded-t-lg" style={{ left: '16%', top: '28%', width: '20%', height: '16%', background: 'linear-gradient(180deg, #1a1a1a 0%, #2d1810 100%)', border: '2px solid #3D2213' }} />
                                    <div className="absolute" style={{ left: '18%', top: '32%', width: '16%', height: '10%', background: 'radial-gradient(ellipse at center bottom, rgba(255,100,20,0.3) 0%, rgba(255,60,0,0.1) 50%, transparent 80%)', pointerEvents: 'none' }} />
                                    <div className="absolute" style={{ left: '10%', top: '46%', width: '32%', height: '3%', background: 'linear-gradient(180deg, #706050, #5A5040)', borderRadius: '0 0 4px 4px', border: '2px solid #4A4030' }} />

                                    {/* Floor */}
                                    <div className="absolute inset-x-0" style={{ top: '72%', height: '1px', background: 'rgba(0,0,0,0.06)' }} />
                                    <div className="absolute inset-x-0" style={{ top: '82%', height: '1px', background: 'rgba(0,0,0,0.05)' }} />

                                    {/* Lights */}
                                    <div className="absolute" style={{ left: '10%', top: '30%', width: '34%', height: '40%', background: 'radial-gradient(ellipse at 50% 30%, rgba(255,150,50,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
                                    <div className="absolute" style={{ left: '60%', top: '0', width: '35%', height: '40%', background: 'radial-gradient(ellipse at 70% 10%, rgba(255,220,150,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
                                </>
                            )}

                            {activeSection.id === 'kitchen' && (
                                <>
                                    {/* Cream Tiled Wall */}
                                    <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #FFFDE7 0%, #FEF9E7 50%, #C8E6C9 100%)' }} />
                                    <div className="absolute inset-x-0 top-0 h-[60%]" style={{ backgroundImage: 'linear-gradient(#00000008 1px, transparent 1px), linear-gradient(90deg, #00000008 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                                    {/* Checkerboard Floor */}
                                    <div className="absolute inset-x-0 bottom-0 h-[40%]" style={{
                                        background: 'conic-gradient(#E0E0E0 90deg, #FFFFFF 90deg 180deg, #E0E0E0 180deg 270deg, #FFFFFF 270deg)',
                                        backgroundSize: '80px 40px',
                                        transform: 'perspective(500px) rotateX(20deg) scale(1.2)',
                                        transformOrigin: 'bottom'
                                    }} />

                                    {/* Upper Cabinets */}
                                    <div className="absolute" style={{ left: '5%', top: '5%', width: '90%', height: '20%', background: '#5D4037', border: '2px solid #3E2723', borderRadius: '4px', boxShadow: '0 4px 8px rgba(0,0,0,0.3)' }} />
                                    <div className="absolute" style={{ left: '6%', top: '6%', width: '28%', height: '18%', background: '#795548', border: '1px solid #4E342E' }} />
                                    <div className="absolute" style={{ left: '36%', top: '6%', width: '28%', height: '18%', background: '#795548', border: '1px solid #4E342E' }} />
                                    <div className="absolute" style={{ left: '66%', top: '6%', width: '28%', height: '18%', background: '#795548', border: '1px solid #4E342E' }} />

                                    {/* Countertop */}
                                    <div className="absolute" style={{ left: '0', top: '55%', width: '100%', height: '5%', background: '#B0BEC5', borderTop: '4px solid #90A4AE' }} />

                                    {/* Lower Cabinets */}
                                    <div className="absolute" style={{ left: '0', top: '60%', width: '100%', height: '25%', background: '#5D4037' }} />
                                    <div className="absolute" style={{ left: '5%', top: '62%', width: '28%', height: '20%', background: '#795548', border: '1px solid #4E342E' }} />
                                    <div className="absolute" style={{ left: '36%', top: '62%', width: '28%', height: '20%', background: '#795548', border: '1px solid #4E342E' }} />
                                    <div className="absolute" style={{ left: '66%', top: '62%', width: '28%', height: '20%', background: '#795548', border: '1px solid #4E342E' }} />
                                </>
                            )}

                            {activeSection.id === 'bedroom' && (
                                <>
                                    {/* Lavender Wall */}
                                    <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #F3E5F5 0%, #E1BEE7 60%, #BA68C8 100%)' }} />
                                    {/* Wallpaper Stripes */}
                                    <div className="absolute inset-x-0 top-0 h-[70%]" style={{ backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.2) 20%, transparent 20%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 70%, transparent 70%)', backgroundSize: '60px 100%' }} />

                                    {/* Wood Floor */}
                                    <div className="absolute inset-x-0 bottom-0 h-[35%]" style={{ background: 'linear-gradient(180deg, #8D6E63 0%, #6D4C41 100%)' }} />

                                    {/* Window (Night/Dusk) */}
                                    <div className="absolute" style={{ left: '35%', top: '10%', width: '30%', height: '25%', background: '#1A237E', border: '6px solid #FFF', borderRadius: '4px', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }} />
                                    <div className="absolute text-white/60 text-xs" style={{ left: '40%', top: '15%' }}>★</div>
                                    <div className="absolute text-white/40 text-xs" style={{ left: '55%', top: '25%' }}>★</div>

                                    {/* Rug */}
                                    <div className="absolute" style={{ left: '25%', top: '75%', width: '50%', height: '15%', background: '#F8BBD0', borderRadius: '50%', border: '4px dashed #F48FB1', opacity: 0.8 }} />
                                </>
                            )}

                            {activeSection.id === 'bathroom' && (
                                <>
                                    {/* Aqua Wall */}
                                    <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #E0F7FA 0%, #B2EBF2 60%, #80DEEA 100%)' }} />
                                    {/* Tiles */}
                                    <div className="absolute inset-x-0 top-0 h-[65%]" style={{ backgroundImage: 'linear-gradient(#00BCD4 1px, transparent 1px), linear-gradient(90deg, #00BCD4 1px, transparent 1px)', backgroundSize: '30px 30px', opacity: 0.1 }} />

                                    {/* Blue Tiled Floor */}
                                    <div className="absolute inset-x-0 bottom-0 h-[35%]" style={{ background: 'conic-gradient(#0097A7 90deg, #00ACC1 90deg 180deg, #0097A7 180deg 270deg, #00ACC1 270deg)', backgroundSize: '40px 40px', transform: 'perspective(600px) rotateX(25deg)' }} />

                                    {/* Mirror Reflection/Backing */}
                                    <div className="absolute" style={{ left: '42%', top: '22%', width: '26%', height: '18%', background: '#E1F5FE', borderRadius: '50%', border: '4px solid #B0BEC5', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }} />

                                    {/* Vanity Counter */}
                                    <div className="absolute" style={{ left: '35%', top: '48%', width: '40%', height: '4%', background: '#ECEFF1', borderBottom: '4px solid #CFD8DC', borderRadius: '4px' }} />
                                </>
                            )}

                            {activeSection.id === 'garden' && (
                                <>
                                    {/* Sunny Sky */}
                                    <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #87CEEB 0%, #B0E0F6 50%, #E8F5E9 100%)' }} />

                                    {/* Grass Floor */}
                                    <div className="absolute inset-x-0 bottom-0 h-[40%]" style={{
                                        background: 'linear-gradient(180deg, #4CAF50 0%, #2E7D32 100%)',
                                        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
                                    }} />

                                    {/* Fence */}
                                    <div className="absolute bottom-[40%] inset-x-0 h-12 flex justify-around opacity-40">
                                        {[...Array(20)].map((_, i) => (
                                            <div key={i} className="w-4 h-full bg-[#A0764E] rounded-t-sm border-x border-black/10" />
                                        ))}
                                    </div>
                                    <div className="absolute bottom-[44%] inset-x-0 h-2 bg-[#8B6533] opacity-30" />

                                    {/* Swimming Pool (CSS) */}
                                    <div className="absolute rounded-[40px]" style={{
                                        left: '25%', top: '55%', width: '50%', height: '25%',
                                        background: 'linear-gradient(135deg, #00B0FF, #0091EA)',
                                        border: '8px solid #E0E0E0',
                                        boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.3), 0 10px 30px rgba(0,0,0,0.2)'
                                    }}>
                                        <div className="absolute inset-2 bg-white/10 rounded-[30px] animate-pulse" />
                                    </div>
                                </>
                            )}

                            {activeSection.id === 'garage' && (
                                <>
                                    {/* Industrial Wall */}
                                    <div className="absolute inset-0" style={{ background: '#CFD8DC' }} />
                                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(90deg, #000 1px, transparent 1px), linear-gradient(#000 1px, transparent 1px)', backgroundSize: '100px 60px' }} />

                                    {/* Concrete Floor */}
                                    <div className="absolute inset-x-0 bottom-0 h-[35%]" style={{ background: 'linear-gradient(180deg, #90A4AE 0%, #546E7A 100%)' }} />

                                    {/* Yellow Floor Line */}
                                    <div className="absolute left-[35%] bottom-0 w-4 h-[35%] bg-yellow-400 opacity-40" style={{ transform: 'perspective(100px) rotateX(45deg)' }} />

                                    {/* Large Garage Door (Segmented) */}
                                    <div className="absolute" style={{ left: '10%', top: '10%', width: '35%', height: '40%', background: '#B0BEC5', border: '4px solid #78909C', borderRadius: '4px' }}>
                                        <div className="h-1/4 border-b-2 border-[#78909C]" />
                                        <div className="h-1/4 border-b-2 border-[#78909C]" />
                                        <div className="h-1/4 border-b-2 border-[#78909C]" />
                                    </div>

                                    {/* Tool Pegboard */}
                                    <div className="absolute" style={{ right: '5%', top: '10%', width: '25%', height: '35%', background: '#37474F', border: '3px solid #263238', borderRadius: '2px' }}>
                                        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                                    </div>

                                    {/* Shelves */}
                                    <div className="absolute" style={{ left: '50%', top: '15%', width: '20%', height: '2px', background: '#546E7A', boxShadow: '0 10px 0 #546E7A, 0 20px 0 #546E7A' }} />
                                </>
                            )}


                            <div className="absolute inset-0 p-8">
                                {/* ═══ LIVING ROOM FURNITURE ═══ */}
                                {activeSection.id === 'living' && (
                                    <>
                                        {/* ── STUDY DESK (lower-left) ── */}
                                        <div className="absolute rounded-t-md" style={{
                                            left: '0%', top: '54%', width: '46%', height: '3.5%',
                                            background: 'linear-gradient(180deg, #8B6914 0%, #6B4226 100%)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                            border: '2px solid #3D2213',
                                            borderTop: '3px solid #C4956A'
                                        }} />
                                        <div className="absolute" style={{ left: '3%', top: '57.5%', width: '2%', height: '10%', background: '#3D2213', borderRadius: '0 0 3px 3px' }} />
                                        <div className="absolute" style={{ left: '42%', top: '57.5%', width: '2%', height: '10%', background: '#3D2213', borderRadius: '0 0 3px 3px' }} />

                                        {/* ── BOOKSHELF (right wall) ── */}
                                        <div className="absolute rounded-md" style={{
                                            left: '64%', top: '22%', width: '34%', height: '40%',
                                            background: 'linear-gradient(180deg, #6B4226 0%, #5A3520 50%, #4A2A18 100%)',
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
                                            border: '3px solid #3D2213'
                                        }} />
                                        <div className="absolute" style={{ left: '66%', top: '40%', width: '30%', height: '2px', background: '#8B6914', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
                                        <div className="absolute" style={{ left: '66%', top: '55%', width: '30%', height: '2px', background: '#8B6914', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
                                        <div className="absolute" style={{ left: '81%', top: '24%', width: '2px', height: '36%', background: '#8B6914', opacity: 0.4 }} />

                                        {/* ── PERSIAN RUG (under seating area) ── */}
                                        <div className="absolute" style={{
                                            left: '16%', top: '74%', width: '68%', height: '18%',
                                            background: 'radial-gradient(ellipse at center, rgba(139,0,0,0.14) 0%, rgba(178,34,34,0.10) 25%, rgba(160,80,30,0.06) 50%, transparent 80%)',
                                            borderRadius: '45%',
                                            border: '2px solid rgba(139,30,30,0.08)'
                                        }} />

                                        {/* ── COFFEE TABLE ── */}
                                        <div className="absolute rounded-md" style={{
                                            left: '40%', top: '84%', width: '20%', height: '3%',
                                            background: 'linear-gradient(180deg, #8B6914 0%, #6B4226 100%)',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                                            border: '2px solid #3D2213',
                                            borderTop: '2px solid #C4956A'
                                        }} />
                                        <div className="absolute" style={{ left: '42%', top: '87%', width: '1.2%', height: '4%', background: '#3D2213', borderRadius: '0 0 2px 2px' }} />
                                        <div className="absolute" style={{ left: '57%', top: '87%', width: '1.2%', height: '4%', background: '#3D2213', borderRadius: '0 0 2px 2px' }} />

                                        {/* ── DECORATIVE SECOND CHAIR (CSS, right of table) ── */}
                                        <div className="absolute" style={{
                                            left: '61%', top: '82%', width: '6%', height: '8%',
                                            background: 'linear-gradient(180deg, #8B6914 0%, #6B4226 100%)',
                                            borderRadius: '4px 4px 0 0',
                                            border: '2px solid #3D2213',
                                            opacity: 0.7
                                        }} />
                                    </>
                                )}

                                {activeSection.items.map(i => {
                                    if (i.hidden) return null;
                                    const scale = i.s || 1;
                                    const baseSize = 80; // px
                                    const size = Math.round(baseSize * scale);
                                    return (
                                        <div
                                            key={i.id}
                                            className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                                            style={{ left: i.x, top: i.y, zIndex: Math.round(parseFloat(i.y) * 10) }}
                                            onClick={() => speakItem(i)}
                                        >
                                            <div className="relative flex flex-col items-center">
                                                <img
                                                    src={getEmojiImg(i.folder)}
                                                    className={cn(
                                                        "drop-shadow-lg transition-all duration-200",
                                                        learnedCount[activeSection.id]?.has(i.id) ? "brightness-110 saturate-125" : "",
                                                        "hover:brightness-125 hover:drop-shadow-[0_0_12px_rgba(255,200,50,0.6)]"
                                                    )}
                                                    style={{
                                                        width: `${size}px`,
                                                        height: `${size}px`,
                                                        objectFit: 'contain',
                                                        transform: i.flip ? 'scaleX(-1)' : 'none'
                                                    }}
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                                />
                                                <div className="absolute -bottom-5 bg-slate-900/90 text-white text-[8px] font-black px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter shadow-xl whitespace-nowrap">
                                                    {i.name}
                                                </div>
                                                {learnedCount[activeSection.id]?.has(i.id) && (
                                                    <div className="absolute -top-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg">
                                                        <Zap size={10} fill="currentColor" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>

                    {/* PROGRESS DOOR */}
                    {canUnlockNext && currentSectionIdx < SECTIONS.length - 1 && (
                        <motion.button
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={() => { setCurrentSectionIdx(prev => prev + 1); playClick(); }}
                            className="absolute right-12 top-1/2 -translate-y-1/2 z-[30] group flex flex-col items-center gap-4"
                        >
                            <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-2xl ring-8 ring-white/50 group-hover:scale-110 transition-transform">
                                <ArrowRight size={48} className="animate-pulse" />
                            </div>
                            <span className="bg-white/90 backdrop-blur px-6 py-2 rounded-full font-black text-[12px] text-indigo-600 shadow-xl uppercase tracking-widest">Next Level</span>
                        </motion.button>
                    )}

                    {currentSectionIdx > 0 && (
                        <button
                            onClick={() => { setCurrentSectionIdx(prev => prev - 1); playClick(); }}
                            className="absolute left-12 top-1/2 -translate-y-1/2 z-[30] bg-white/80 backdrop-blur p-4 rounded-full shadow-lg hover:bg-white transition-colors opacity-40 hover:opacity-100"
                        >
                            <ArrowRight size={24} className="rotate-180 text-slate-800" />
                        </button>
                    )}
                </div>

                {/* ZOOM OVERLAY */}
                <AnimatePresence>
                    {isLearningItem && selectedItem && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[150] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-8">
                            <div className="relative w-full max-w-4xl flex flex-col items-center text-center">
                                <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="w-64 h-64 md:w-96 md:h-96 mb-8 relative">
                                    <div className="absolute inset-0 bg-white/10 rounded-full blur-[80px]" />
                                    <img src={getEmojiImg(selectedItem.folder)} className="w-full h-full object-contain filter drop-shadow-[0_0_40px_white]" />
                                </motion.div>
                                <div className="text-white">
                                    <h2 className="text-7xl md:text-8xl font-black uppercase tracking-tighter leading-none m-0">{selectedItem.name}</h2>
                                    <p className="text-indigo-400 text-3xl font-bold mt-2 italic">{selectedItem.es}</p>
                                    <div className="mt-10 bg-white/5 border border-white/10 p-8 rounded-[3rem] backdrop-blur-xl max-w-2xl mx-auto">
                                        <p className="text-2xl font-semibold">{selectedItem.enS}</p>
                                        <p className="text-indigo-200 text-xl font-medium mt-1 italic opacity-80">{selectedItem.esS}</p>
                                    </div>
                                    <div className="mt-10 flex flex-col items-center gap-8">
                                        {/* CIRCULAR FEEDBACK ZONE */}
                                        <motion.div
                                            animate={isListening ? { scale: [1, 1.05, 1] } : {}}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            className={cn(
                                                "w-40 h-40 rounded-full flex items-center justify-center transition-all border-8 shadow-[0_0_50px_rgba(0,0,0,0.3)] relative",
                                                isListening ? "border-cyan-400 bg-cyan-950/50 shadow-cyan-500/40" : "border-white/10 bg-white/5 shadow-none"
                                            )}
                                        >
                                            {isListening ? (
                                                <>
                                                    <Mic size={60} className="text-cyan-400 animate-pulse relative z-10" />
                                                    {/* Animated Rings */}
                                                    <motion.div
                                                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                                        transition={{ repeat: Infinity, duration: 1 }}
                                                        className="absolute inset-0 bg-cyan-500 rounded-full"
                                                    />
                                                </>
                                            ) : (
                                                <Volume2 size={60} className="text-white/20" />
                                            )}
                                        </motion.div>

                                        <div className="flex flex-col md:flex-row gap-6">
                                            <Button
                                                variant="outline"
                                                onClick={() => speakItem(selectedItem)}
                                                className="rounded-[2rem] bg-white/5 border-2 border-white/20 text-white hover:bg-white/15 px-10 py-8 text-xl font-black transition-all group"
                                            >
                                                <RotateCcw size={28} className="mr-3 group-hover:rotate-180 transition-transform duration-500" />
                                                ESCUCHAR DE NUEVO
                                            </Button>

                                            <Button
                                                variant="default"
                                                onClick={() => {
                                                    playClick();
                                                    startVoice(selectedItem);
                                                }}
                                                disabled={isListening}
                                                className={cn(
                                                    "rounded-[2rem] px-12 py-8 text-2xl font-black transition-all flex items-center gap-4 shadow-2xl border-b-8 active:border-b-0 active:translate-y-2",
                                                    isListening ? "bg-slate-700 border-slate-900 text-slate-400" : "bg-cyan-500 border-cyan-700 text-white hover:bg-cyan-400"
                                                )}
                                            >
                                                <Mic size={32} /> {isListening ? "LISTENING..." : "PROBAR DE NUEVO"}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex flex-col items-center gap-2">
                                        <p className={cn("text-xs font-black uppercase tracking-[0.4em] transition-all", isListening ? "text-cyan-400 animate-pulse" : "text-white/30")}>
                                            {isListening ? "Siri is listening for your voice..." : "Voice identification required"}
                                        </p>
                                        {isListening && (
                                            <div className="flex gap-1 h-1 items-center">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <motion.div key={i} animate={{ height: [2, 12, 2] }} transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }} className="w-1 bg-cyan-400 rounded-full" />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Button variant="ghost" onClick={() => { setIsLearningItem(false); setSelectedItem(null); }} className="absolute top-0 right-0 text-white/20 hover:text-white"><X size={60} /></Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </motion.div>
        </div>
    );
};
