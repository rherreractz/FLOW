import { PrismaClient } from '@prisma/client'

type LeadSource = 'LANDING' | 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'MANUAL'
type LeadStatus = 'RAW' | 'QUALIFIED' | 'FALSE_NEGATIVE' | 'CONTACTED' | 'CONVERTED' | 'LOST'

const prisma = new PrismaClient()

// ─── Configuración del tenant de demostración ──────────────────────────────────
const DEMO_SLUG = 'demo-clinica'

// Nombres y mensajes realistas para generar leads variados.
// Cada mensaje está pensado para representar distintos niveles de intención,
// de modo que el clasificador (y el dashboard) muestren un espectro creíble.
const SAMPLE_LEADS: Array<{
  name: string
  phone: string
  email?: string
  source: LeadSource
  status: LeadStatus
  score: number
  rawMessage: string
  /** hace cuántas horas llegó el lead (para distribuir en el tiempo) */
  hoursAgo: number
}> = [
  // — Alta intención: QUALIFIED —
  {
    name: 'María Fernanda López',
    phone: '+52 998 123 4567',
    email: 'mariafer.lopez@gmail.com',
    source: 'WHATSAPP',
    status: 'QUALIFIED',
    score: 92,
    rawMessage: 'Hola, quiero agendar una limpieza dental para esta semana. ¿Tienen disponibilidad el jueves por la tarde?',
    hoursAgo: 1,
  },
  {
    name: 'Carlos Mendoza',
    phone: '+52 998 234 5678',
    email: 'carlos.mendoza@outlook.com',
    source: 'LANDING',
    status: 'QUALIFIED',
    score: 88,
    rawMessage: 'Necesito una cita urgente, tengo un dolor de muela muy fuerte desde ayer. ¿Cuánto cuesta la consulta?',
    hoursAgo: 2,
  },
  {
    name: 'Ana Sofía Ramírez',
    phone: '+52 984 345 6789',
    email: 'anasofia.r@gmail.com',
    source: 'INSTAGRAM',
    status: 'QUALIFIED',
    score: 85,
    rawMessage: 'Vi sus precios de ortodoncia en la publicación. Me interesa empezar tratamiento, ¿hacen valoración gratis?',
    hoursAgo: 4,
  },
  {
    name: 'Jorge Iván Castillo',
    phone: '+52 998 456 7890',
    email: 'jorge.castillo@hotmail.com',
    source: 'WHATSAPP',
    status: 'CONTACTED',
    score: 79,
    rawMessage: 'Buenas, quería información sobre blanqueamiento dental y precios.',
    hoursAgo: 6,
  },
  {
    name: 'Lucía Hernández',
    phone: '+52 984 567 8901',
    source: 'FACEBOOK',
    status: 'QUALIFIED',
    score: 81,
    rawMessage: 'Hola! Quiero llevar a mi hijo de 8 años a revisión. ¿Atienden niños?',
    hoursAgo: 8,
  },

  // — Convertidos —
  {
    name: 'Roberto Aguilar',
    phone: '+52 998 678 9012',
    email: 'roberto.aguilar@gmail.com',
    source: 'LANDING',
    status: 'CONVERTED',
    score: 95,
    rawMessage: 'Quiero agendar para implante dental, ya me hicieron presupuesto en otro lado pero prefiero su clínica.',
    hoursAgo: 26,
  },
  {
    name: 'Patricia Gómez',
    phone: '+52 984 789 0123',
    email: 'paty.gomez@yahoo.com',
    source: 'WHATSAPP',
    status: 'CONVERTED',
    score: 90,
    rawMessage: 'Confirmo mi cita del viernes a las 5pm para la endodoncia. Gracias!',
    hoursAgo: 30,
  },

  // — Intención media: RAW (sin clasificar aún o en zona gris) —
  {
    name: 'Diego Torres',
    phone: '+52 998 890 1234',
    source: 'INSTAGRAM',
    status: 'RAW',
    score: 0,
    rawMessage: '¿Cuánto cuesta?',
    hoursAgo: 0.5,
  },
  {
    name: 'Valentina Cruz',
    phone: '+52 984 901 2345',
    email: 'vale.cruz@gmail.com',
    source: 'LANDING',
    status: 'RAW',
    score: 0,
    rawMessage: 'Información',
    hoursAgo: 0.2,
  },
  {
    name: 'Fernando Ríos',
    phone: '+52 998 012 3456',
    source: 'WHATSAPP',
    status: 'CONTACTED',
    score: 64,
    rawMessage: 'Hola, ¿qué horarios manejan?',
    hoursAgo: 12,
  },

  // — Falsos negativos / spam: FALSE_NEGATIVE —
  {
    name: 'Promo Marketing MX',
    phone: '+52 555 111 2222',
    email: 'ventas@promomarketing.mx',
    source: 'INSTAGRAM',
    status: 'FALSE_NEGATIVE',
    score: 8,
    rawMessage: '¡Hola! Ofrecemos servicios de publicidad digital para tu clínica. Aumenta tus clientes 300%. Responde INFO.',
    hoursAgo: 5,
  },
  {
    name: 'jhon doe',
    phone: '+1 555 000 0000',
    source: 'LANDING',
    status: 'FALSE_NEGATIVE',
    score: 3,
    rawMessage: 'asdfghjkl test test',
    hoursAgo: 18,
  },
  {
    name: 'Soporte Técnico',
    phone: '+52 800 999 8888',
    source: 'FACEBOOK',
    status: 'FALSE_NEGATIVE',
    score: 12,
    rawMessage: 'Su dominio está por expirar. Renueve aquí: bit.ly/renovar-dominio',
    hoursAgo: 22,
  },

  // — Perdidos —
  {
    name: 'Gabriela Núñez',
    phone: '+52 984 222 3333',
    email: 'gaby.nunez@gmail.com',
    source: 'WHATSAPP',
    status: 'LOST',
    score: 70,
    rawMessage: 'Quería cita pero al final ya resolví en otra clínica, gracias.',
    hoursAgo: 48,
  },
  {
    name: 'Andrés Villanueva',
    phone: '+52 998 333 4444',
    source: 'LANDING',
    status: 'LOST',
    score: 55,
    rawMessage: 'Me pareció caro, gracias de todos modos.',
    hoursAgo: 52,
  },

  // — Más leads recientes para llenar el dashboard —
  {
    name: 'Daniela Ortiz',
    phone: '+52 984 444 5555',
    email: 'dani.ortiz@outlook.com',
    source: 'INSTAGRAM',
    status: 'QUALIFIED',
    score: 83,
    rawMessage: 'Hola, quiero saber si tienen planes de pago para ortodoncia invisible.',
    hoursAgo: 3,
  },
  {
    name: 'Miguel Ángel Sánchez',
    phone: '+52 998 555 6666',
    source: 'WHATSAPP',
    status: 'CONTACTED',
    score: 72,
    rawMessage: 'Buenas tardes, necesito una extracción de muela del juicio.',
    hoursAgo: 9,
  },
  {
    name: 'Regina Flores',
    phone: '+52 984 666 7777',
    email: 'regina.flores@gmail.com',
    source: 'LANDING',
    status: 'QUALIFIED',
    score: 87,
    rawMessage: 'Me gustaría agendar una valoración para carillas dentales. ¿Qué días tienen disponibles?',
    hoursAgo: 5,
  },
  {
    name: 'Pablo Guerrero',
    phone: '+52 998 777 8888',
    source: 'FACEBOOK',
    status: 'RAW',
    score: 0,
    rawMessage: 'Hola',
    hoursAgo: 0.1,
  },
  {
    name: 'Isabela Morales',
    phone: '+52 984 888 9999',
    email: 'isa.morales@yahoo.com',
    source: 'WHATSAPP',
    status: 'QUALIFIED',
    score: 91,
    rawMessage: 'Quiero agendar limpieza y revisión general para mí y mi esposo. ¿Tienen paquete para parejas?',
    hoursAgo: 2,
  },
]

async function main() {
  console.log('🌱 Iniciando seed...\n')

  // 1. Limpiar datos previos del tenant demo (idempotente)
  const existing = await prisma.tenant.findUnique({ where: { slug: DEMO_SLUG } })
  if (existing) {
    console.log(`🧹 Tenant "${DEMO_SLUG}" ya existe — limpiando datos previos...`)
    await prisma.tenant.delete({ where: { slug: DEMO_SLUG } })
    // onDelete: Cascade borra config, leads, events, etc.
  }

  // 2. Crear tenant demo con su configuración visual
  const tenant = await prisma.tenant.create({
    data: {
      slug: DEMO_SLUG,
      name: 'Clínica Dental García',
      plan: 'PRO',
      config: {
        create: {
          primaryColor: '#0F6E56', // teal oscuro
          accentColor: '#EF9F27', // amber
          backgroundColor: '#F9FAFB',
          fontHeading: 'Inter',
          fontBody: 'Inter',
          metaTitle: 'Clínica Dental García — Agenda tu cita en minutos',
          metaDescription:
            'Atención dental de calidad en Cancún. Respondemos tus consultas automáticamente, 24/7. Agenda tu cita hoy.',
        },
      },
      users: {
        create: {
          email: 'admin@clinicagarcia.mx',
          role: 'OWNER',
        },
      },
    },
    include: { config: true },
  })

  console.log(`✅ Tenant creado: ${tenant.name}`)
  console.log(`   slug: ${tenant.slug}`)
  console.log(`   landing: http://localhost:3000/${tenant.slug}`)
  console.log(`   colores: ${tenant.config?.primaryColor} / ${tenant.config?.accentColor}\n`)

  // 3. Crear automatización de ejemplo (para que el dashboard la muestre luego)
  await prisma.automation.create({
    data: {
      tenantId: tenant.id,
      trigger: 'LEAD_QUALIFIED',
      name: 'Respuesta automática a lead calificado',
      active: true,
      config: {
        channel: 'whatsapp',
        template: 'Hola {name}, gracias por contactar a Clínica Dental García. ¿Te gustaría agendar tu cita?',
      },
    },
  })
  console.log('✅ Automatización de ejemplo creada\n')

  // 4. Crear los leads de muestra con sus eventos
  const now = Date.now()
  let count = 0

  for (const sample of SAMPLE_LEADS) {
    const createdAt = new Date(now - sample.hoursAgo * 60 * 60 * 1000)

    const lead = await prisma.lead.create({
      data: {
        tenantId: tenant.id,
        name: sample.name,
        phone: sample.phone,
        email: sample.email,
        source: sample.source,
        status: sample.status,
        score: sample.score,
        rawMessage: sample.rawMessage,
        metadata: { seeded: true },
        createdAt,
        updatedAt: createdAt,
      },
    })

    // Evento de creación
    await prisma.leadEvent.create({
      data: {
        leadId: lead.id,
        type: 'created',
        payload: { source: sample.source },
        createdAt,
      },
    })

    // Si ya fue clasificado, registrar el evento de scoring
    if (sample.status !== 'RAW') {
      await prisma.leadEvent.create({
        data: {
          leadId: lead.id,
          type: 'scored',
          payload: { score: sample.score, status: sample.status },
          createdAt: new Date(createdAt.getTime() + 30 * 1000), // 30s después
        },
      })
    }

    count++
  }

  console.log(` ${count} leads de muestra creados\n`)

  // 5. Resumen por estado
  const summary = await prisma.lead.groupBy({
    by: ['status'],
    where: { tenantId: tenant.id },
    _count: true,
  })

  console.log('Distribución de leads:')
  for (const row of summary) {
    console.log(`   ${row.status.padEnd(16)} ${row._count}`)
  }

  console.log('\n Seed completado.')
  console.log(`\n Abre la landing en: http://localhost:3000/${DEMO_SLUG}`)
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })