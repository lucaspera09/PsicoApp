import { useMemo, useState } from 'react'

export default function AgendaHoyGrid({
  turnos,
  horariosSemanales,
  onTurnoClick,
  onRegistrarSesion
}) {
  const hoy = new Date()

  const [fechaActual, setFechaActual] =
    useState(() => {
      const fecha = new Date()
      fecha.setHours(0, 0, 0, 0)

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

  const turnosDelDia =
    useMemo(() => {
      return turnos
        .filter((turno) => {
          if (!turno.fechaInicio) {
            return false
          }

          return esMismoDia(
            new Date(
              turno.fechaInicio
            ),
            fechaActual
          )
        })
        .sort(
          (a, b) =>
            new Date(
              a.fechaInicio
            ) -
            new Date(
              b.fechaInicio
            )
        )
    }, [
      turnos,
      fechaActual
    ])

  const horariosVirtuales =
    useMemo(() => {
      return horariosSemanales
        .filter((horario) =>
          horarioAplicaEnFecha(
            horario,
            fechaActual
          )
        )
        .map((horario) => {
          const fechaInicio =
            construirFechaHora(
              fechaActual,
              horario.horaInicio
            )

          const fechaFin =
            construirFechaHora(
              fechaActual,
              horario.horaFin
            )

          const pacientesHorario =
            obtenerPacientesHorario(
              horario
            )

          return {
            _id:
              `horario-${horario._id}-${fechaActual
                .toISOString()
                .slice(0, 10)}`,

            horarioSemanalId:
              horario._id,

            esHorarioFijo:
              true,

            participantes:
              pacientesHorario.map(
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
          }
        })
        .filter(
          (horario) =>
            horario.participantes
              .length > 0
        )
    }, [
      horariosSemanales,
      fechaActual
    ])

  const mismosParticipantes = (
    turnoReal,
    horarioVirtual
  ) => {
    const idsTurno =
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

    const idsHorario =
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
      idsTurno.length !==
      idsHorario.length
    ) {
      return false
    }

    return idsTurno.every(
      (id, index) =>
        id ===
        idsHorario[index]
    )
  }

  const existeTurnoReal = (
    horarioVirtual
  ) => {
    return turnosDelDia.some(
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

  const elementosDia =
    useMemo(() => {
      return [
        ...turnosDelDia,
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
      turnosDelDia,
      horariosSinDuplicar
    ])

  const minutosInicio =
    elementosDia.map(
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
    elementosDia.map(
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
    (horaFin - horaInicio) * 2

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

  const obtenerPosicionTurno = (
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
      programado: 'Programado',
      realizado: 'Realizado',
      cancelado: 'Cancelado',
      no_asistio: 'No asistió'
    }

    return (
      estados[estado] ||
      estado
    )
  }

  const claseEstado = (
    estado
  ) => {
    if (estado === 'realizado') {
      return 'done'
    }

    if (estado === 'cancelado') {
      return 'cancelled'
    }

    if (estado === 'no_asistio') {
      return 'absent'
    }

    return 'scheduled'
  }

  const tituloFecha =
    fechaActual.toLocaleDateString(
      'es-UY',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }
    )

  const tituloFormateado =
    tituloFecha
      .charAt(0)
      .toUpperCase() +
    tituloFecha.slice(1)

  const irDiaAnterior = () => {
    setFechaActual(
      (prev) => {
        const nueva =
          new Date(prev)

        nueva.setDate(
          nueva.getDate() - 1
        )

        nueva.setHours(
          0,
          0,
          0,
          0
        )

        return nueva
      }
    )
  }

  const irDiaSiguiente = () => {
    setFechaActual(
      (prev) => {
        const nueva =
          new Date(prev)

        nueva.setDate(
          nueva.getDate() + 1
        )

        nueva.setHours(
          0,
          0,
          0,
          0
        )

        return nueva
      }
    )
  }

  const volverHoy = () => {
    const fecha =
      new Date()

    fecha.setHours(
      0,
      0,
      0,
      0
    )

    setFechaActual(fecha)
  }

  const mostrandoHoy =
    esMismoDia(
      fechaActual,
      hoy
    )

  return (
    <section className="day-agenda">

      <div className="day-agenda-navigation">

        <button
          type="button"
          className="day-nav-button"
          onClick={irDiaAnterior}
        >
          ←
        </button>

        <div className="day-agenda-title">

          <span>
            Día
          </span>

          <strong>
            {tituloFormateado}
          </strong>

          {mostrandoHoy && (
            <small>
              Hoy
            </small>
          )}

        </div>

        <button
          type="button"
          className="day-nav-button"
          onClick={irDiaSiguiente}
        >
          →
        </button>

        <button
          type="button"
          className="day-today-button"
          onClick={volverHoy}
          disabled={mostrandoHoy}
        >
          Hoy
        </button>

      </div>

      {elementosDia.length === 0 && (
        <div className="day-agenda-empty">
          No hay pacientes para este día.
        </div>
      )}

      <div className="day-agenda-calendar">

        <div
          className="day-time-column"
          style={{
            '--day-blocks':
              cantidadBloques
          }}
        >
          {bloquesHorario.map(
            (bloque) => (
              <div
                key={bloque.minutos}
                className="day-time-cell"
              >
                {bloque.texto}
              </div>
            )
          )}
        </div>

        <div
          className="day-turn-column"
          style={{
            '--day-blocks':
              cantidadBloques
          }}
        >

          {bloquesHorario.map(
            (bloque) => (
              <div
                key={bloque.minutos}
                className="day-grid-cell"
              />
            )
          )}

          {elementosDia.map(
            (turno) => {
              const {
                filaInicio,
                duracion
              } =
                obtenerPosicionTurno(
                  turno
                )

              const participantes =
                turno.participantes ||
                []

              return (
  <article
    key={turno._id}
    className={
      turno.esHorarioFijo
        ? 'day-turn-card fixed'
        : 'day-turn-card'
    }
    onClick={() =>
      onTurnoClick(turno)
    }
    style={{
      gridRow:
        `${filaInicio} / span ${duracion}`
    }}
  >

    <div className="day-turn-header">

      <strong>
        {mostrarHora(
          turno.fechaInicio
        )}

        {' – '}

        {mostrarHora(
          turno.fechaFin
        )}
      </strong>

      {turno.esHorarioFijo && (
        <span className="day-fixed-badge">
          Horario fijo
        </span>
      )}

    </div>

    <div className="day-turn-patients">

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
              className="day-turn-patient"
            >

              <strong>
                {paciente?.nombre}{' '}
                {paciente?.apellido}
              </strong>

              {!turno.esHorarioFijo && (
                <span
                  className={`day-turn-status ${claseEstado(
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

    {participantes.length > 1 && (
      <span className="day-patient-count">
        {participantes.length}{' '}
        pacientes
      </span>
    )}

    {participantes.some(
      (participante) =>
        turno.esHorarioFijo ||
        participante.estado ===
          'programado'
    ) && (

      <div className="day-turn-quick-actions">

        <button
          type="button"
          className="day-turn-register-button"
          onClick={(event) => {
            event.stopPropagation()

            onRegistrarSesion?.(
              turno
            )
          }}
        >
          📝 Registrar sesión
        </button>

      </div>

    )}

  </article>

              )
            }
          )}

        </div>

      </div>

    </section>
  )
}