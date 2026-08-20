import { useMemo, useState } from 'react'

export default function AgendaSemanalGrid({
  turnos,
  horariosSemanales,
  onTurnoClick
}) {
  const hoy = new Date()

  const obtenerInicioSemana = (fechaBase) => {
    const fecha = new Date(fechaBase)
    const dia = fecha.getDay()

    const diferencia =
      dia === 0
        ? -6
        : 1 - dia

    fecha.setDate(
      fecha.getDate() + diferencia
    )

    fecha.setHours(0, 0, 0, 0)

    return fecha
  }

  const [
    semanaActual,
    setSemanaActual
  ] = useState(() =>
    obtenerInicioSemana(
      new Date()
    )
  )

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
      hora.split(':').map(Number)

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

  const dias = useMemo(() => {
    return Array.from(
      { length: 7 },
      (_, index) => {
        const fecha =
          new Date(
            semanaActual
          )

        fecha.setDate(
          fecha.getDate() +
            index
        )

        return fecha
      }
    )
  }, [semanaActual])

  const finSemana =
    useMemo(() => {
      const fecha =
        new Date(
          semanaActual
        )

      fecha.setDate(
        fecha.getDate() + 7
      )

      return fecha
    }, [semanaActual])

  const turnosSemana =
    useMemo(() => {
      return turnos.filter(
        (turno) => {
          if (
            !turno.fechaInicio
          ) {
            return false
          }

          const fechaTurno =
            new Date(
              turno.fechaInicio
            )

          return (
            fechaTurno >=
              semanaActual &&
            fechaTurno <
              finSemana
          )
        }
      )
    }, [
      turnos,
      semanaActual,
      finSemana
    ])

  const horariosVirtuales =
    useMemo(() => {
      const resultado = []

      dias.forEach((dia) => {
        horariosSemanales
          .filter((horario) =>
            horarioAplicaEnFecha(
              horario,
              dia
            )
          )
          .forEach((horario) => {
            const pacientes =
              obtenerPacientesHorario(
                horario
              )

            if (
              pacientes.length === 0
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
                  .slice(0, 10)}`,

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
          })
      })

      return resultado
    }, [
      dias,
      horariosSemanales
    ])

  const mismosParticipantes = (
    turnoReal,
    horarioVirtual
  ) => {
    const idsReal =
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

    const idsVirtual =
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
      idsReal.length !==
      idsVirtual.length
    ) {
      return false
    }

    return idsReal.every(
      (id, index) =>
        id ===
        idsVirtual[index]
    )
  }

  const existeTurnoReal = (
    horarioVirtual
  ) => {
    return turnosSemana.some(
      (turno) => {
        const fechaTurno =
          new Date(
            turno.fechaInicio
          )

        const fechaHorario =
          new Date(
            horarioVirtual.fechaInicio
          )

        const mismaHora =
          fechaTurno.getHours() ===
            fechaHorario.getHours() &&
          fechaTurno.getMinutes() ===
            fechaHorario.getMinutes()

        return (
          esMismoDia(
            fechaTurno,
            fechaHorario
          ) &&
          mismaHora &&
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

  const elementosSemana =
    useMemo(() => {
      return [
        ...turnosSemana,
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
      turnosSemana,
      horariosSinDuplicar
    ])

  const minutosInicio =
    elementosSemana.map(
      (turno) => {
        const fecha =
          new Date(
            turno.fechaInicio
          )

        return (
          fecha.getHours() *
            60 +
          fecha.getMinutes()
        )
      }
    )

  const minutosFin =
    elementosSemana.map(
      (turno) => {
        const fecha =
          new Date(
            turno.fechaFin
          )

        return (
          fecha.getHours() *
            60 +
          fecha.getMinutes()
        )
      }
    )

  const horaInicio =
    minutosInicio.length > 0
      ? Math.min(
          8,
          Math.floor(
            Math.min(
              ...minutosInicio
            ) / 60
          )
        )
      : 8

  const horaFin =
    minutosFin.length > 0
      ? Math.max(
          18,
          Math.ceil(
            Math.max(
              ...minutosFin
            ) / 60
          )
        )
      : 18

  const cantidadBloques =
    (horaFin - horaInicio) *
    2

  const bloquesHorario =
    Array.from(
      {
        length:
          cantidadBloques
      },
      (_, index) => {
        const minutos =
          horaInicio * 60 +
          index * 30

        const hora =
          Math.floor(
            minutos / 60
          )

        const minuto =
          minutos % 60

        return {
          minutos,

          texto: `${String(
            hora
          ).padStart(
            2,
            '0'
          )}:${String(
            minuto
          ).padStart(
            2,
            '0'
          )}`
        }
      }
    )

  const obtenerTurnosDia = (
    fecha
  ) => {
    return elementosSemana.filter(
      (turno) =>
        esMismoDia(
          new Date(
            turno.fechaInicio
          ),
          fecha
        )
    )
  }

  const obtenerFilaTurno = (
    turno
  ) => {
    const inicio =
      new Date(
        turno.fechaInicio
      )

    const fin =
      new Date(
        turno.fechaFin
      )

    const minutosInicio =
      inicio.getHours() *
        60 +
      inicio.getMinutes()

    const minutosFin =
      fin.getHours() *
        60 +
      fin.getMinutes()

    const inicioAgenda =
      horaInicio * 60

    const filaInicio =
      Math.floor(
        (
          minutosInicio -
          inicioAgenda
        ) / 30
      ) + 1

    const duracion =
      Math.max(
        1,
        Math.ceil(
          (
            minutosFin -
            minutosInicio
          ) / 30
        )
      )

    return {
      filaInicio,
      duracion
    }
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

  const mostrarEstado = (
    estado
  ) => {
    const estados = {
      programado:
        'Programado',

      realizado:
        'Realizado',

      cancelado:
        'Cancelado',

      no_asistio:
        'No asistió'
    }

    return (
      estados[estado] ||
      estado
    )
  }

  const claseEstado = (
    estado
  ) => {
    if (
      estado ===
      'realizado'
    ) {
      return 'done'
    }

    if (
      estado ===
      'cancelado'
    ) {
      return 'cancelled'
    }

    if (
      estado ===
      'no_asistio'
    ) {
      return 'absent'
    }

    return 'scheduled'
  }

  const tituloDia = (
    fecha
  ) => {
    const nombre =
      fecha.toLocaleDateString(
        'es-UY',
        {
          weekday: 'short'
        }
      )

    return `${nombre
      .charAt(0)
      .toUpperCase()}${nombre.slice(
      1
    )} ${fecha.getDate()}`
  }

  const irSemanaAnterior = () => {
    setSemanaActual(
      (prev) => {
        const nueva =
          new Date(prev)

        nueva.setDate(
          nueva.getDate() -
            7
        )

        return nueva
      }
    )
  }

  const irSemanaSiguiente = () => {
    setSemanaActual(
      (prev) => {
        const nueva =
          new Date(prev)

        nueva.setDate(
          nueva.getDate() +
            7
        )

        return nueva
      }
    )
  }

  const volverSemanaActual = () => {
    setSemanaActual(
      obtenerInicioSemana(
        new Date()
      )
    )
  }

  const ultimoDia =
    dias[6]

  const tituloSemana =
    `${dias[0].toLocaleDateString(
      'es-UY',
      {
        day: '2-digit',
        month: '2-digit'
      }
    )} - ${ultimoDia.toLocaleDateString(
      'es-UY',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    )}`

  return (
    <section className="week-agenda">

      {/* NAVEGACION */}

      <div className="week-agenda-navigation">

        <button
          type="button"
          className="week-nav-button"
          onClick={irSemanaAnterior}
        >
          ←
        </button>

        <div className="week-agenda-title">

          <span>
            Semana
          </span>

          <strong>
            {tituloSemana}
          </strong>

        </div>

        <button
          type="button"
          className="week-nav-button"
          onClick={irSemanaSiguiente}
        >
          →
        </button>

        <button
          type="button"
          className="week-current-button"
          onClick={volverSemanaActual}
        >
          Esta semana
        </button>

      </div>

      {/* CALENDARIO */}

      <div className="week-agenda-scroll">

        <div className="week-agenda-grid">

          {/* HEADER */}

          <div className="week-time-header">
            Hora
          </div>

          {dias.map((dia) => {
            const esHoy =
              esMismoDia(
                dia,
                hoy
              )

            return (
              <div
                key={dia.toISOString()}
                className={
                  esHoy
                    ? 'week-day-header today'
                    : 'week-day-header'
                }
              >
                <span>
                  {tituloDia(dia)}
                </span>

                {esHoy && (
                  <small>
                    Hoy
                  </small>
                )}
              </div>
            )
          })}

          {/* HORAS */}

          <div
            className="week-time-column"
            style={{
              '--week-blocks':
                cantidadBloques
            }}
          >
            {bloquesHorario.map(
              (bloque) => (
                <div
                  key={
                    bloque.minutos
                  }
                  className="week-time-cell"
                >
                  {bloque.texto}
                </div>
              )
            )}
          </div>

          {/* DÍAS */}

          {dias.map((dia) => {
            const turnosDia =
              obtenerTurnosDia(
                dia
              )

            const esHoy =
              esMismoDia(
                dia,
                hoy
              )

            return (
              <div
                key={dia.toISOString()}
                className={
                  esHoy
                    ? 'week-day-column today'
                    : 'week-day-column'
                }
                style={{
                  '--week-blocks':
                    cantidadBloques
                }}
              >

                {bloquesHorario.map(
                  (bloque) => (
                    <div
                      key={
                        bloque.minutos
                      }
                      className="week-grid-cell"
                    />
                  )
                )}

                {turnosDia.map(
                  (turno) => {
                    const {
                      filaInicio,
                      duracion
                    } =
                      obtenerFilaTurno(
                        turno
                      )

                    const participantes =
                      turno.participantes ||
                      []

                    return (
                      <button
                        key={turno._id}
                        type="button"
                        className={
                          turno.esHorarioFijo
                            ? 'week-turn fixed'
                            : 'week-turn'
                        }
                        onClick={() =>
                          onTurnoClick(
                            turno
                          )
                        }
                        style={{
                          gridRow:
                            `${filaInicio} / span ${duracion}`
                        }}
                      >

                        <div className="week-turn-time">
                          {mostrarHora(
                            turno.fechaInicio
                          )}
                        </div>

                        <div className="week-turn-patients">

                          {participantes.map(
                            (
                              participante,
                              index
                            ) => {
                              const paciente =
                                participante.paciente

                              return (
                                <div
                                  key={
                                    obtenerIdPaciente(
                                      paciente
                                    ) ||
                                    index
                                  }
                                  className="week-turn-patient"
                                >

                                  <strong>
                                    {paciente?.nombre}{' '}
                                    {paciente?.apellido}
                                  </strong>

                                  {!turno.esHorarioFijo && (
                                    <span
                                      className={`week-turn-status ${claseEstado(
                                        participante.estado
                                      )}`}
                                    >
                                      {mostrarEstado(
                                        participante.estado
                                      )}
                                    </span>
                                  )}

                                </div>
                              )
                            }
                          )}

                        </div>

                        {turno.esHorarioFijo && (
                          <span className="week-fixed-label">
                            Horario fijo
                          </span>
                        )}

                      </button>
                    )
                  }
                )}

              </div>
            )
          })}

        </div>

      </div>

    </section>
  )
}