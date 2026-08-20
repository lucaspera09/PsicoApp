import { useMemo, useState } from 'react'

export default function AgendaMensualGrid({
  turnos,
  horariosSemanales,
  onTurnoClick
}) {
  const hoy = new Date()

  const [
    mesActual,
    setMesActual
  ] = useState(() => {
    const fecha = new Date()

    fecha.setDate(1)

    fecha.setHours(
      0,
      0,
      0,
      0
    )

    return fecha
  })

  const esMismoDia = (
    fecha1,
    fecha2
  ) => {
    return (
      fecha1.getFullYear() ===
        fecha2.getFullYear() &&
      fecha1.getMonth() ===
        fecha2.getMonth() &&
      fecha1.getDate() ===
        fecha2.getDate()
    )
  }

  const construirFechaHora = (
    fechaBase,
    hora
  ) => {
    const [horas, minutos] =
      hora
        .split(':')
        .map(Number)

    const fecha =
      new Date(fechaBase)

    fecha.setHours(
      horas,
      minutos,
      0,
      0
    )

    return fecha
  }

  const obtenerIdPaciente = (
    paciente
  ) => {
    if (!paciente) {
      return null
    }

    return (
      paciente._id ||
      paciente
    ).toString()
  }

  const obtenerPacientesHorario = (
    horario
  ) => {
    if (
      Array.isArray(
        horario.pacientes
      )
    ) {
      return horario.pacientes
    }

    if (horario.paciente) {
      return [
        horario.paciente
      ]
    }

    return []
  }

  const horarioAplicaEnFecha = (
    horario,
    fecha
  ) => {
    if (!horario.activo) {
      return false
    }

    if (
      horario.diaSemana !==
      fecha.getDay()
    ) {
      return false
    }

    const fechaDia =
      new Date(fecha)

    fechaDia.setHours(
      0,
      0,
      0,
      0
    )

    if (horario.fechaDesde) {
      const desde =
        new Date(
          horario.fechaDesde
        )

      desde.setHours(
        0,
        0,
        0,
        0
      )

      if (
        fechaDia <
        desde
      ) {
        return false
      }
    }

    if (horario.fechaHasta) {
      const hasta =
        new Date(
          horario.fechaHasta
        )

      hasta.setHours(
        23,
        59,
        59,
        999
      )

      if (
        fechaDia >
        hasta
      ) {
        return false
      }
    }

    return true
  }

  const diasCalendario =
    useMemo(() => {
      const primerDiaMes =
        new Date(
          mesActual.getFullYear(),
          mesActual.getMonth(),
          1
        )

      const diaSemana =
        primerDiaMes.getDay()

      const diferencia =
        diaSemana === 0
          ? -6
          : 1 - diaSemana

      const inicio =
        new Date(
          primerDiaMes
        )

      inicio.setDate(
        inicio.getDate() +
          diferencia
      )

      return Array.from(
        {
          length: 42
        },
        (_, index) => {
          const fecha =
            new Date(inicio)

          fecha.setDate(
            inicio.getDate() +
              index
          )

          fecha.setHours(
            0,
            0,
            0,
            0
          )

          return fecha
        }
      )
    }, [mesActual])

  const turnosEnCalendario =
    useMemo(() => {
      if (
        diasCalendario.length ===
        0
      ) {
        return []
      }

      const inicio =
        diasCalendario[0]

      const fin =
        new Date(
          diasCalendario[
            diasCalendario.length -
              1
          ]
        )

      fin.setDate(
        fin.getDate() + 1
      )

      return turnos.filter(
        (turno) => {
          if (!turno.fechaInicio) {
            return false
          }

          const fecha =
            new Date(
              turno.fechaInicio
            )

          return (
            fecha >= inicio &&
            fecha < fin
          )
        }
      )
    }, [
      turnos,
      diasCalendario
    ])

  const horariosVirtuales =
    useMemo(() => {
      const resultado = []

      diasCalendario.forEach(
        (dia) => {
          horariosSemanales
            .filter(
              (horario) =>
                horarioAplicaEnFecha(
                  horario,
                  dia
                )
            )
            .forEach(
              (horario) => {
                const pacientes =
                  obtenerPacientesHorario(
                    horario
                  )

                if (
                  pacientes.length ===
                  0
                ) {
                  return
                }

                const fechaInicio =
                  construirFechaHora(
                    dia,
                    horario.horaInicio
                  )

                const fechaFin =
                  construirFechaHora(
                    dia,
                    horario.horaFin
                  )

                resultado.push({
                  _id:
                    `horario-${horario._id}-${dia
                      .toISOString()
                      .slice(
                        0,
                        10
                      )}`,

                  horarioSemanalId:
                    horario._id,

                  esHorarioFijo:
                    true,

                  participantes:
                    pacientes.map(
                      (paciente) => ({
                        paciente,
                        estado:
                          'programado'
                      })
                    ),

                  fechaInicio:
                    fechaInicio.toISOString(),

                  fechaFin:
                    fechaFin.toISOString()
                })
              }
            )
        }
      )

      return resultado
    }, [
      diasCalendario,
      horariosSemanales
    ])

  const mismosParticipantes = (
    turnoReal,
    horarioVirtual
  ) => {
    const reales =
      (
        turnoReal.participantes ||
        []
      )
        .map(
          (participante) =>
            obtenerIdPaciente(
              participante.paciente
            )
        )
        .filter(Boolean)
        .sort()

    const virtuales =
      (
        horarioVirtual.participantes ||
        []
      )
        .map(
          (participante) =>
            obtenerIdPaciente(
              participante.paciente
            )
        )
        .filter(Boolean)
        .sort()

    if (
      reales.length !==
      virtuales.length
    ) {
      return false
    }

    return reales.every(
      (id, index) =>
        id ===
        virtuales[index]
    )
  }

  const existeTurnoReal = (
    horarioVirtual
  ) => {
    return turnosEnCalendario.some(
      (turno) => {
        const fechaTurno =
          new Date(
            turno.fechaInicio
          )

        const fechaHorario =
          new Date(
            horarioVirtual.fechaInicio
          )

        return (
          esMismoDia(
            fechaTurno,
            fechaHorario
          ) &&
          fechaTurno.getHours() ===
            fechaHorario.getHours() &&
          fechaTurno.getMinutes() ===
            fechaHorario.getMinutes() &&
          mismosParticipantes(
            turno,
            horarioVirtual
          )
        )
      }
    )
  }

  const horariosSinDuplicar =
    horariosVirtuales.filter(
      (horario) =>
        !existeTurnoReal(
          horario
        )
    )

  const elementosCalendario =
    useMemo(() => {
      return [
        ...turnosEnCalendario,
        ...horariosSinDuplicar
      ].sort(
        (a, b) =>
          new Date(
            a.fechaInicio
          ) -
          new Date(
            b.fechaInicio
          )
      )
    }, [
      turnosEnCalendario,
      horariosSinDuplicar
    ])

  const obtenerTurnosDia = (
    dia
  ) => {
    return elementosCalendario.filter(
      (turno) =>
        esMismoDia(
          new Date(
            turno.fechaInicio
          ),
          dia
        )
    )
  }

  const mostrarHora = (
    fecha
  ) => {
    return new Date(
      fecha
    ).toLocaleTimeString(
      'es-UY',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    )
  }

  const nombrePacientes = (
    turno
  ) => {
    const participantes =
      turno.participantes ||
      []

    if (
      participantes.length ===
      0
    ) {
      return 'Sin pacientes'
    }

    if (
      participantes.length ===
      1
    ) {
      const paciente =
        participantes[0]
          .paciente

      return `${paciente?.nombre || ''} ${
        paciente?.apellido || ''
      }`.trim()
    }

    const primero =
      participantes[0]
        .paciente

    const primerNombre =
      `${primero?.nombre || ''} ${
        primero?.apellido || ''
      }`.trim()

    return `${primerNombre} +${
      participantes.length -
      1
    }`
  }

  const irMesAnterior = () => {
    setMesActual(
      (prev) =>
        new Date(
          prev.getFullYear(),
          prev.getMonth() - 1,
          1
        )
    )
  }

  const irMesSiguiente = () => {
    setMesActual(
      (prev) =>
        new Date(
          prev.getFullYear(),
          prev.getMonth() + 1,
          1
        )
    )
  }

  const volverMesActual = () => {
    const fecha =
      new Date()

    fecha.setDate(1)

    fecha.setHours(
      0,
      0,
      0,
      0
    )

    setMesActual(fecha)
  }

  const tituloMes =
    mesActual.toLocaleDateString(
      'es-UY',
      {
        month: 'long',
        year: 'numeric'
      }
    )

  const tituloFormateado =
    tituloMes
      .charAt(0)
      .toUpperCase() +
    tituloMes.slice(1)

  const nombresDias = [
    'Lun',
    'Mar',
    'Mié',
    'Jue',
    'Vie',
    'Sáb',
    'Dom'
  ]

  return (
    <section className="month-agenda">

      {/* NAVEGACIÓN */}

      <div className="month-agenda-navigation">

        <button
          type="button"
          className="month-nav-button"
          onClick={irMesAnterior}
        >
          ←
        </button>

        <div className="month-agenda-title">
          <span>
            Mes
          </span>

          <strong>
            {tituloFormateado}
          </strong>
        </div>

        <button
          type="button"
          className="month-nav-button"
          onClick={irMesSiguiente}
        >
          →
        </button>

        <button
          type="button"
          className="month-current-button"
          onClick={volverMesActual}
        >
          Este mes
        </button>

      </div>

      {/* CALENDARIO */}

      <div className="month-agenda-scroll">

        <div className="month-agenda-grid">

          {nombresDias.map(
            (dia) => (
              <div
                key={dia}
                className="month-day-name"
              >
                {dia}
              </div>
            )
          )}

          {diasCalendario.map(
            (dia) => {
              const turnosDia =
                obtenerTurnosDia(
                  dia
                )

              const esMesActual =
                dia.getMonth() ===
                  mesActual.getMonth() &&
                dia.getFullYear() ===
                  mesActual.getFullYear()

              const esHoy =
                esMismoDia(
                  dia,
                  hoy
                )

              const visibles =
                turnosDia.slice(
                  0,
                  3
                )

              const restantes =
                turnosDia.length -
                visibles.length

              return (
                <div
                  key={dia.toISOString()}
                  className={[
                    'month-day-cell',
                    !esMesActual
                      ? 'outside'
                      : '',
                    esHoy
                      ? 'today'
                      : ''
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >

                  <div className="month-day-number">

                    <span>
                      {dia.getDate()}
                    </span>

                    {esHoy && (
                      <small>
                        Hoy
                      </small>
                    )}

                  </div>

                  <div className="month-day-events">

                    {visibles.map(
                      (turno) => (
                        <button
                          key={turno._id}
                          type="button"
                          className={
                            turno.esHorarioFijo
                              ? 'month-event fixed'
                              : 'month-event'
                          }
                          onClick={() =>
                            onTurnoClick(
                              turno
                            )
                          }
                        >

                          <span className="month-event-time">
                            {mostrarHora(
                              turno.fechaInicio
                            )}
                          </span>

                          <strong>
                            {nombrePacientes(
                              turno
                            )}
                          </strong>

                          {turno.esHorarioFijo && (
                            <span className="month-fixed-label">
                              Fijo
                            </span>
                          )}

                        </button>
                      )
                    )}

                    {restantes > 0 && (
                      <div className="month-more-events">
                        + {restantes} más
                      </div>
                    )}

                  </div>

                </div>
              )
            }
          )}

        </div>

      </div>

    </section>
  )
}